<template>
    <div>
        <div class="container mx-auto leading-normal">

            <img src="../assets/logo.png" alt="Arlington 2050 Carbon Neutral Logo" class="max-w-xl mx-auto" />

            <h1 class="text-6xl font-bold text-yellow-500 text-center mb-4">Here comes the sun</h1>

            <p class="text-xl text-gray-200 my-2">The new Amazon-Arlington Solar Farm Virginia project is <span class="text-2xl tracking-wider">BIG</span>. Arlington is purchasing the power output from approximately 475 acres. That’s over 360 football fields of solar!</p>

            <p class="text-xl text-gray-200 my-2">This new solar electricity will go onto the grid and offset over 80% of the Arlington County government’s electricity use. Our streetlights and stoplights, fire stations, community centers, water treatment plant, Trades Center, County offices, and more.</p>

            <p class="text-xl text-gray-200 my-2">This is a huge step towards your Arlington County government using <a href="https://arlingtonva.s3.amazonaws.com/wp-content/uploads/sites/13/2019/10/Final-CEP-CLEAN-003.pdf" target="_blank">100% renewable electricity by 2025.</a></p>

            <p class="text-xl text-gray-200 my-2">The farm may be in Pittsylvania County, but if it were in Arlington, just how big would it be?</p>

            <p class="text-xl text-gray-200 my-2">See how the size of the new solar farm compares to the size of your civic association. Enter your address to find out (we don’t save this data).</p>

            <div class="w-32 h-32" v-if="false"><svg class="text-yellow-500 fill-current rotate-self absolute w-32" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30.729 30.728"><path d="M15.373 7.571a7.775 7.775 0 1 1 0 15.55 7.777 7.777 0 0 1-7.78-7.775 7.777 7.777 0 0 1 7.78-7.775zm5.58 7.775a5.547 5.547 0 0 0-1.638-3.947 5.552 5.552 0 0 0-3.942-1.633 5.557 5.557 0 0 0-3.947 1.633 5.55 5.55 0 0 0-1.638 3.947c0 1.545.623 2.933 1.638 3.947a5.555 5.555 0 0 0 3.947 1.633 5.55 5.55 0 0 0 3.942-1.633 5.546 5.546 0 0 0 1.638-3.947zm-12.56 6.99c.426.43.426 1.123 0 1.553l-2.366 2.366a1.105 1.105 0 0 1-1.554 0 1.105 1.105 0 0 1 0-1.554l2.366-2.366a1.106 1.106 0 0 1 1.554 0zm8.07 3.981v3.36c-.06 1.402-2.137 1.402-2.197 0v-3.36c.06-1.403 2.136-1.403 2.196 0zm9.79-1.615c1.035 1.033-.515 2.587-1.55 1.554l-2.367-2.366c-1.036-1.033.514-2.587 1.55-1.554zm3.424-10.436c1.403.06 1.403 2.136 0 2.196h-3.34c-1.404-.06-1.404-2.136 0-2.196zm-3.425-9.812c.43.43.43 1.124 0 1.554l-2.344 2.344c-1.033 1.036-2.587-.514-1.554-1.55l2.348-2.348a1.1 1.1 0 0 1 1.55 0zm-9.79-3.402v3.32c-.06 1.402-2.136 1.402-2.196 0v-3.32c.06-1.403 2.136-1.403 2.196 0zM8.375 6.825a1.1 1.1 0 0 1-.004 1.554 1.1 1.1 0 0 1-1.554-.009L4.473 6.004C3.443 4.965 5 3.42 6.031 4.458zM4.39 14.266c.61 0 1.098.492 1.098 1.098 0 .606-.487 1.098-1.098 1.098H1.052c-1.403-.06-1.403-2.136 0-2.196z"></path></svg></div>

            <form @submit.prevent="handleFormSubmitted" class="max-w-xl mx-auto my-8">
                <div class="flex">
                  <input type="text" class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" placeholder="2100 Clarendon Blvd, Arlington, VA 22201" v-model="address" />
                  <button type="submit" class="bg-yellow-500 font-bold px-4 py-3 flex-none rounded ml-2">Find me</button>
                </div>


                <div v-if="errorMessage" class="text-red-500 font-bold mt-1 rounded">{{ errorMessage }}</div>
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

            <p class="text-xl text-gray-200 my-2">What can you do?  Join a solar co-op for your home or business!  Leave  your email and we’ll be in touch with more info:</p>
        </div>

    <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true"
             data-projection="EPSG:4326" style="height: 800px">
      <vl-view :zoom.sync="zoom" :center.sync="center" ref="mapView"></vl-view>

      <vl-layer-tile id="geocodio" :opacity="0.2">
        <vl-source-xyz url="https://tile-cdn.geocod.io/tiles/geocodio/{z}/{x}/{y}.png"></vl-source-xyz>
      </vl-layer-tile>

      <vl-layer-vector>
        <vl-source-vector url="/civic-associations-reprojected.geojson"></vl-source-vector>
        <vl-style-box>
          <vl-style-stroke color="#222" :width="3"></vl-style-stroke>
          <vl-style-fill color="rgba(255,255,255,0.1)"></vl-style-fill>
        </vl-style-box>
      </vl-layer-vector>

      <vl-layer-vector>
        <vl-feature>
          <vl-geom-point
            :coordinates="addressResultPoint || [-77.099113, 38.885484]"
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

  export default {
    mounted() {
      this.loadBoundaries();
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
        boundaryLookup: null
      }
    },
    methods: {
        loadBoundaries() {
          axios.get('/civic-associations.geojson').then(response => {
            this.boundaries = response.data;
            this.boundaryLookup = new GeoJsonGeometriesLookup(this.boundaries);
          }).catch(e => {
            this.errorMessage = `Could not load civic association boundaries: ${e.message || e}`;
          });
        },
        handleFormSubmitted() {
            if (!this.boundaryLookup) {
              this.errorMessage = 'Please wait until boundaries are loaded';
            } else if (this.address.length > 0) {
              this.isLoading = true;
              this.errorMessage = null;

              const query = qs.stringify({'q': this.address, 'api_key': '57f15ff4e5ed5dd43213e3d5e5262dfdee5f41f'});

              axios.get('https://api.geocod.io/v1.4/geocode?' + query).then(response => {
                  this.isLoading = false;
                  this.addressResult = response.data.results[0] || null;

                  if (this.addressResult) {
                      this.addressResultPoint = [this.addressResult.location.lng, this.addressResult.location.lat];
                      window.vm.$refs.mapView.animate({
                        center: this.addressResultPoint,
                        zoom: 15
                      });

                      const point = {type: "Point", coordinates: this.addressResultPoint};
                      const match = this.boundaryLookup.getContainers(point);

                      this.matchedBoundary = match.features.length > 0
                          ? match.features[0].properties
                          : null;
                  }
              }).catch(e => {
                  this.isLoading = false;
                  this.errorMessage = `Could not look up address: ${e.message || e}`;
              });
            }
        },
    }
  }
</script>