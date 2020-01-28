<template>
    <div>
        <div class="mx-2 container sm:mx-auto leading-normal">
            <introduction></introduction>

            <form v-if="!matchedBoundary && !isLoading" @submit.prevent="addressSubmitted" class="sm:max-w-xl sm:mx-auto my-8">
                <div class="flex">
                  <input type="text" class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" placeholder="2100 Clarendon Blvd" v-model="address" />
                  <button type="submit" class="bg-yellow-500 font-bold px-4 py-3 flex-none rounded ml-2">Find me</button>
                </div>


                <div v-if="errorMessage" class="text-red-500 font-bold mt-1 rounded">{{ errorMessage }}</div>
            </form>

            <loading v-if="isLoading"></loading>

            <div v-if="matchedBoundary" class="text-gray-200 text-lg sm:text-2xl my-8 sm:my-16 text-center leading-loose p-4 rounded-lg shadow-lg bg-gray-700">
                <p>
                    You address is in <strong>{{ matchedBoundary.CIVIC }}</strong>
                    which is <strong>{{ matchedBoundary.ACRES || 'unknown' }} acres.</strong>
                </p>

                <p v-if="matchedBoundary.ACRES > 0" class="text-2xl sm:text-4xl">
                    The Arlington solar farm is {{ sizeDescription }} the size of <strong>{{ matchedBoundary.CIVIC }}</strong>.
                </p>

                <p><a href="/" class="underline text-base text-gray-400">Try a different address?</a></p>
            </div>
        </div>

        <vl-map v-if="boundaries.length > 0" ref="map" :controls="false" :load-tiles-while-animating="true" :load-tiles-while-interacting="true" data-projection="EPSG:4326" style="height: 600px">
            <vl-view :zoom.sync="zoom" :center.sync="center" @created="mapCreated" ref="mapView"></vl-view>

            <vl-layer-tile id="geocodio" :opacity="0.2">
                <vl-source-xyz url="https://tile-cdn.geocod.io/tiles/geocodio/{z}/{x}/{y}.png"></vl-source-xyz>
            </vl-layer-tile>

            <vl-layer-vector>
                <vl-feature
                    v-for="(boundary) in boundaries"
                    :key="boundary.properties.id"
                    :id="boundary.properties.id"
                >
                    <vl-geom-polygon :coordinates="boundary.geometry.coordinates" />

                    <vl-style-box>
                        <vl-style-stroke color="#222" :width="3"></vl-style-stroke>
                        <vl-style-fill color="rgba(255,255,255,0.1)"></vl-style-fill>
                        <vl-style-text v-if="zoom > 13" :text="boundary.properties.CIVIC" font="16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'"></vl-style-text>
                    </vl-style-box>
                </vl-feature>
            </vl-layer-vector>

            <vl-layer-vector v-if="farmBoundary">
                <vl-feature>
                    <vl-geom-polygon :coordinates="farmBoundary"></vl-geom-polygon>

                    <vl-style-box>
                        <vl-style-fill color="rgba(255, 255, 0, 0.5)"></vl-style-fill>
                    </vl-style-box>
                </vl-feature>
            </vl-layer-vector>

            <vl-layer-vector v-if="farmBoundaryCenter && !addressResult">
                <vl-feature>
                    <vl-geom-point :coordinates="[farmBoundaryCenter.longitude, farmBoundaryCenter.latitude]"></vl-geom-point>

                    <vl-style-box>
                        <vl-style-icon src="/img/solar-panel.png" :anchor="[0.5, 0.5]" :scale="1.0"></vl-style-icon>
                    </vl-style-box>
                </vl-feature>
            </vl-layer-vector>

            <vl-layer-vector v-if="addressResultPoint">
                <vl-feature>
                    <vl-geom-point :coordinates="addressResultPoint"></vl-geom-point>

                    <vl-style-box>
                        <vl-style-icon src="/img/marker.png" :anchor="[0.5, 0.5]" :scale="0.5"></vl-style-icon>
                    </vl-style-box>
                </vl-feature>
            </vl-layer-vector>
        </vl-map>

        <email-form></email-form>
  </div>
</template>

<script>
  import axios from 'axios'
  import qs from 'qs'
  import { getBoundsOfDistance, getCenterOfBounds } from 'geolib'
  import GeoJsonGeometriesLookup from 'geojson-geometries-lookup'
  import Introduction from '../components/Introduction'
  import Loading from '../components/Loading'
  import EmailForm from '../components/EmailForm'

  export default {
    components: {
        'introduction': Introduction,
        'email-form': EmailForm,
        'loading': Loading,
    },
    mounted() {
      this.loadBoundaries();
      this.updateSolarFarmBoundary();
    },
    computed: {
        sizeDescription() {
            const size = Math.round(this.solarSizeAcres / this.matchedBoundary.ACRES * 10) / 10;

            if (size !== 1) {
                return `${size}x`;
            } else {
                return 'roughly';
            }
        },
        farmBoundaryCenter() {
            let location = {
                latitude: this.center[1],
                longitude: this.center[0]
            };

            if (this.matchedBoundary) {
                const bounds = this.boundaries[0].geometry.coordinates[0].map(item => {
                    return {
                        latitude: item[1],
                        longitude: item[0],
                    }
                });

                location = getCenterOfBounds(bounds);
            }

            return location;
        }
    },
    data () {
      return {
        zoom: 13,
        center: [-77.099113, 38.885484],
        address: '',
        addressResult: null,
        addressResultPoint: null,
        isLoading: false,
        errorMessage: null,
        matchedBoundary: null,
        solarSizeAcres: 476,
        boundaries: [],
        boundaryLookup: null,
        farmBoundary: null
      }
    },
    methods: {
        loadBoundaries() {
          axios.get('/civic-associations.geojson').then(response => {
            this.boundaries = response.data.features;
            this.boundaryLookup = new GeoJsonGeometriesLookup(response.data);
          }).catch(e => {
            this.errorMessage = `Could not load civic association boundaries: ${e.message || e}`;
          });
        },
        addressSubmitted() {
            if (!this.boundaryLookup) {
              this.errorMessage = 'Please wait until boundaries are loaded';
            } else if (this.address.length > 0) {
              this.isLoading = true;
              this.errorMessage = null;

              const query = qs.stringify({'q': this.address + ' Arlington VA', 'api_key': '57f15ff4e5ed5dd43213e3d5e5262dfdee5f41f'});

              axios.get('https://api.geocod.io/v1.4/geocode?' + query).then(response => {
                  this.isLoading = false;
                  this.addressResult = response.data.results[0] || null;

                  if (this.addressResult) {
                      if (this.addressResult.accuracy < 0.8) {
                        throw new Error('Address does not seem to be valid');
                      }

                      if (this.addressResult.address_components.city !== 'Arlington' || this.addressResult.address_components.state !== 'VA') {
                        throw new Error('Could not find address in Arlington, VA');
                      }

                      this.addressResultPoint = [this.addressResult.location.lng, this.addressResult.location.lat];

                      const point = {type: "Point", coordinates: this.addressResultPoint};
                      const match = this.boundaryLookup.getContainers(point);

                      this.matchedBoundary = match.features.length > 0
                          ? match.features[0].properties
                          : null;

                      if (this.matchedBoundary) {
                        this.boundaries = this.boundaries.filter(boundary => boundary.properties.CIVIC === this.matchedBoundary.CIVIC);
                      }

                      this.updateSolarFarmBoundary();

                      setTimeout(() => {
                        this.$refs.mapView.animate({
                            center: this.addressResultPoint,
                            zoom: 15
                        });
                      }, 250);
                  }
              }).catch(e => {
                  this.isLoading = false;
                  this.errorMessage = `Could not look up address: ${e.message || e}`;
              });
            }
        },
        updateSolarFarmBoundary() {
            const bounds = getBoundsOfDistance(this.farmBoundaryCenter, 694);

            const sw = bounds[0];
            const ne = bounds[1];

            this.farmBoundary = [[
                [sw.longitude, ne.latitude],
                [ne.longitude, ne.latitude],
                [ne.longitude, sw.latitude],
                [sw.longitude, sw.latitude],
                [sw.longitude, ne.latitude],
            ]];
        },
        mapCreated() {
            this.$refs.map.$map.getInteractions().clear();
        }
    }
  }
</script>
