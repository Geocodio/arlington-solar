<template>
    <div>
        <div class="container mx-auto leading-normal">
            <h1 class="text-6xl font-bold text-yellow-500 text-center">Here comes the sun</h1>
            <p class="text-xl text-gray-200 my-2">The new Amazon-Arlington Solar Farm Virginia project is big. 476 acres to be exact. That’s over 360 football fields.</p>

            <p class="text-xl text-gray-200 my-2">The solar electricity will power and offset over 80% of the Arlington County government’s electricity use. Our libraries. Stoplights. (Green lights, too.) Fire stations, community centers, the Arlington County Trades Center, the water treatment plant… and more.</p>

            <p class="text-xl text-gray-200 my-2">This is a huge step towards your Arlington County government using 100% renewable electricity by 2025.  </p>

            <p class="text-xl text-gray-200 my-2">The farm may be in Pittsylvania County, but if it were in Arlington, just how big would it be?</p>

            <p class="text-xl text-gray-200 my-2">See how the size of the new solar farm compares to your neighborhood. Enter your address to find out (we don’t save this data).</p>

            <form @submit.prevent="handleFormSubmitted">
                <input type="text" class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded my-8 py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" placeholder="2100 Clarendon Blvd, Arlington, VA 22201" v-model="address" />
            </form>
        </div>

    <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true"
             data-projection="EPSG:4326" style="height: 800px">
      <vl-view :zoom.sync="zoom" :center.sync="center"></vl-view>

      <vl-geoloc @update:position="geolocPosition = $event">
        <template slot-scope="geoloc">
          <vl-feature v-if="geoloc.position" id="position-feature">
            <vl-geom-point :coordinates="geoloc.position"></vl-geom-point>
            <vl-style-box>
              <vl-style-icon src="_media/marker.png" :scale="0.4" :anchor="[0.5, 1]"></vl-style-icon>
            </vl-style-box>
          </vl-feature>
        </template>
      </vl-geoloc>

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
            :coordinates="[-77.14578895348512,38.902050311618886]"
          ></vl-geom-point>

          <vl-style-box>
            <vl-style-circle :radius="40">
              <vl-style-fill color="yellow"></vl-style-fill>
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

  export default {
    data () {
      return { 
        zoom: 13,
        center: [-77.099113, 38.885484],
        geolocPosition: undefined,
        address: '',
        addressResult: null,
        isLoading: false,
        errorMesasge: null
      }
    },
    methods: {
        handleFormSubmitted() {
            this.isLoading = true;
            this.errorMessage = null;

            const query = qs.stringify({'q': this.address, 'api_key': '57f15ff4e5ed5dd43213e3d5e5262dfdee5f41f'});

            axios.get('https://api.geocod.io/v1.4/geocode?' + query).then(response => {
                this.isLoading = false;
                this.addressResult = response.results[0] || null;
            }).catch(() => {
                this.isLoading = false;
                this.errorMessage = 'Could not look up address'
            });
        },
    }
  }
</script>