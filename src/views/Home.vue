<template>
    <div>
        <div class="container mx-auto leading-normal">
            <h1 class="text-6xl font-bold text-yellow-500 text-center mb-4">Here comes the sun</h1>
            <p class="text-xl text-gray-200 my-2">The new Amazon-Arlington Solar Farm Virginia project is big. {{ solarSizeAcres }} acres to be exact. That’s over 360 football fields.</p>

            <p class="text-xl text-gray-200 my-2">The solar electricity will power and offset over 80% of the Arlington County government’s electricity use. Our libraries. Stoplights. (Green lights, too.) Fire stations, community centers, the Arlington County Trades Center, the water treatment plant… and more.</p>

            <p class="text-xl text-gray-200 my-2">This is a huge step towards your Arlington County government using 100% renewable electricity by 2025.  </p>

            <p class="text-xl text-gray-200 my-2">The farm may be in Pittsylvania County, but if it were in Arlington, just how big would it be?</p>

            <p class="text-xl text-gray-200 my-2">See how the size of the new solar farm compares to your neighborhood. Enter your address to find out (we don’t save this data).</p>

            <form @submit.prevent="handleFormSubmitted">
                <input type="text" class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded my-8 py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" placeholder="2100 Clarendon Blvd, Arlington, VA 22201" v-model="address" />
                <div v-if="errorMessage" class="text-red-500 bg-gray-400 font-bold my-4 p-2 rounded">{{ errorMessage }}</div>
            </form>

            <div v-if="matchedBoundary" class="text-gray-200 text-2xl my-16 text-center leading-loose">
                <p>
                    You address is in <strong>{{ matchedBoundary.CIVIC }}</strong>
                    which is <strong>{{ matchedBoundary.ACRES || 'unknown' }} acres.</strong>
                </p>

                <p v-if="matchedBoundary.ACRES > 0" class="text-4xl">
                    The Arlington solar farm is {{ Math.round(solarSizeAcres / matchedBoundary.ACRES * 10) / 10 }}x the size of <strong>{{ matchedBoundary.CIVIC }}</strong>.
                </p>
            </div>
        </div>

    <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true"
             data-projection="EPSG:4326" style="height: 800px">
      <vl-view :zoom.sync="zoom" :center.sync="center"></vl-view>

      <vl-layer-tile id="geocodio" :opacity="0.2">
        <vl-source-xyz url="https://tile-cdn.geocod.io/tiles/geocodio/{z}/{x}/{y}.png"></vl-source-xyz>
      </vl-layer-tile>

      <vl-layer-vector>
        <vl-source-vector url="/civic-associations-reprojected.geojson"></vl-source-vector>
        <vl-style-box>
          <vl-style-stroke color="#222" :width="3"></vl-style-stroke>
          <vl-style-fill color="rgba(255,255,255,0.5)"></vl-style-fill>
        </vl-style-box>
      </vl-layer-vector>

      <vl-layer-vector>
        <vl-feature>
          <vl-geom-point
            :coordinates="addressResultPoint || center"
          ></vl-geom-point>

          <vl-style-box>
            <vl-style-circle :radius="10 * zoom">
              <vl-style-fill color="rgba(255, 255, 0, 0.5)"></vl-style-fill>
            </vl-style-circle>
          </vl-style-box>
        </vl-feature>
      </vl-layer-vector>
    </vl-map>
  </div>
</template>

<script>
  import axios from 'axios'
  import qs from 'qs'
  import GeoJsonGeometriesLookup from 'geojson-geometries-lookup';
  import boundaries from '../boundaries';
  import acres from '../acres';

  const boundaryLookup = new GeoJsonGeometriesLookup(boundaries);

  export default {
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
        solarSizeAcres: 476
      }
    },
    methods: {
        handleFormSubmitted() {
            this.isLoading = true;
            this.errorMessage = null;

            const query = qs.stringify({'q': this.address, 'api_key': '57f15ff4e5ed5dd43213e3d5e5262dfdee5f41f'});

            axios.get('https://api.geocod.io/v1.4/geocode?' + query).then(response => {
                this.isLoading = false;
                this.addressResult = response.data.results[0] || null;

                if (this.addressResult) {
                    this.addressResultPoint = [this.addressResult.location.lng, this.addressResult.location.lat];
                    this.center = this.addressResultPoint;
                    this.zoom = 15;

                    const point = {type: "Point", coordinates: this.addressResultPoint};
                    const match = boundaryLookup.getContainers(point);

                    this.matchedBoundary = match.features.length > 0
                        ? match.features[0].properties
                        : null;

                    if (this.matchedBoundary) {
                        this.matchedBoundary.ACRES = acres[this.matchedBoundary.CIVIC];
                    }
                }
            }).catch(e => {
                this.isLoading = false;
                this.errorMessage = `Could not look up address: ${e.message || e}`;
            });
        },
    }
  }
</script>