<template>
  <div class="container">
    <form>
      <div class="form-group">
        <label for="term" class="col-sm-1-12 col-form-label">State</label>
        <div class="col-sm-1-12">
            <input v-model="state" type="text" class="form-control" name="inputName" id="state" placeholder="Enter a State">
        </div>
        <button type="button" @click="getStateUrls(state)" class="btn btn-primary">Add</button>
      </div>
    </form>
    <h2 v-if="urls.length > 0">Choose a City</h2>
    <p @click="sendSingleSearch(url)" v-for="url in urls" :key="url">{{ url.name }}</p>
    <p @click="sendAllSearch()" v-if="urls.length > 0">All</p>
  </div>
</template>

<script>
import states from '../data/stateData.js'
import Router from '@/router'
const API_URL = 'http://localhost:5000/search/'
  export default {
    data: () => ({
        state: '',
        urls: []
    }),
    methods: {
      getStateUrls(state) {
        const stateAbbreviation = states[state.toUpperCase()];
        const url = `${API_URL}${stateAbbreviation}`
        fetch(url)
          .then(res => res.json())
          .then(json => {
              this.urls = json.results
          });
      },
      sendSingleSearch(url) {
          Router.push({name: 'search', params: {url: url}});
      },
      sendAllSearch() {
        Router.push({name: 'search', params: {url: this.urls}});
      },
    }
  };
</script>
