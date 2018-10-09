<template>
  <div>
    <div v-cloak>
        <div class="container">
            <form @submit.prevent="addTerm">
                <div class="form-group">
                    <label for="term" class="col-sm-1-12 col-form-label">Term</label>
                    <div class="col-sm-1-12">
                        <input v-model="term" type="text" class="form-control" name="inputName" id="term" placeholder="Enter a Search Term">
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">Add</button>
                <button v-if="activeTerm && !loading" @click="hideActiveTerm(activeResults)" type="button" class="btn btn-primary">Remove</button>
            </form>
            <section class="mt-3">
                <ul class="nav nav-tabs">
                    <li @click="setActiveTerm(term)" v-for="term in terms" class="nav-item" :key="term">
                        <a :class="{ active:activeTerm==term }" class="nav-link" href="#">{{ term }}</a>                                
                    </li>
                </ul>
                <section class="row">
                    <div class="col-12 loading" v-if="loading">
                        <img class="image-fluid" src="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy-downsized.gif" alt="">
                    </div>
                    <div v-for="result in activeResults" class="card col-4" :key="result.link" v-if=" !loading && !hiddenResults[result.link]">
                        <div class="image mt-1">
                            <p @click="hideResult(result)" class="text-right hide">❌</p>
                            <img v-if="result.images.length > 0" class="card-img-top testimg" :src="result.images[0]" :alt="result.title">
                            <img v-else src="https://minneapolis.craigslist.org/images/peace.jpg" class="card-img-top mt-2" alt="">
                        </div>
                        <div class="card-body">
                            <h5 class="card-title"> <small>{{ result.date }}</small> <a :href="result.link" rel="noopener noreferrer" target="_blank">{{ result.title }}</a> <small>({{result.location}})</small></h5>
                            <p v-if="result.price" class="card-text">{{ result.price }}</p>
                            <p v-else class="card-text">No Price Listed</p>
                        </div>
                    </div>
                </section>
            </section>
        </div>   
    </div>
  </div>
</template>

<script>
import router from '../router.js'
const API_URL = 'http://localhost:5000/search/'
export default {
  data: () => ({
        loading: false,
        term: '',
        terms: [],
        activeTerm: null,
        activeResults: [],
        hiddenResults: {},
        url: []
    }),
    created() {
        this.url = this.$route.params.url
    },
    mounted() {
        if (localStorage.terms) {
            this.terms = JSON.parse(localStorage.terms);
        }

        if (localStorage.hiddenResults) {
            this.hiddenResults = JSON.parse(localStorage.hiddenResults);
        }
    },
    methods: {
        addTerm() {
            if (this.term && !this.terms.includes(this.term)) {
                this.terms.push(this.term)
                localStorage.terms = JSON.stringify(this.terms);
            }
        },
        setActiveTerm(term) {
            this.activeResults = [];
            this.activeTerm = term;
            this.loading = true;
            const test = this.url;
            console.log(test);
            
            const url = `${API_URL}${term}`;
            fetch(url, {
                method: "POST",
                body: JSON.stringify({url: test}),
                headers: {'Content-Type': 'application/json'}
                })
                .then(res => res.json())
                .then(json => {
                    this.activeResults = json.results;
                    this.loading = false;
                });
        },
        hideResult(result) {
            this.$set(this.hiddenResults, result.link, true);
            localStorage.hiddenResults = JSON.stringify(this.hiddenResults);
        },
        hideActiveTerm(term) {
            const index = this.terms.indexOf(term);
            this.terms.splice(index, 1);
            localStorage.terms = JSON.stringify(this.terms);
            this.activeResults = [];
            this.activeTerm = '';
        },
    }
};
</script>

<style>
  @import url('https://bootswatch.com/4/sandstone/bootstrap.min.css');

  [v-cloak] {
    display: none;
  }

.loading {
    width: 100px;
    height: 100px;

    position: absolute;
    top:0;
    bottom: 0;
    left: 0;
    right: 0;

    margin: auto;
}

.image {
    position:relative
}

.hide {
    position: absolute; 
    left: 0; 
    cursor: pointer;
    width: 100%;
}
</style>

