var app = new Vue({
    el: "#app",

    data: {
        emptyParent: '00000000-0000-0000-0000-000000000000',
        swiperSlides: [],
        priceList: [],
        parent: null,
        errors: []
    },

    computed: {
        currentItems: function () {
            return this.priceList
                        .filter(item => item.parent === this.parent)
                        .sort((a, b) => (a.isGroup === b.isGroup) 
                                        ? (a.name > b.name ? 1 : -1)
                                        : (a.isGroup ? -1 : 1))
        },

    },

    methods: {
        init: function () {
            for (i = 0; i < 10; i++) {
                this.swiperSlides.push({
                    id: i,
                    name: `Slide ${(i + 1)}`,
                    image: `image${(i + 1)}.jpg`
                })
            }
        },

        getItemRepresentation: function (item) {
            return "(" + item.code + ") " + item.name + (item.isGroup ? "" : " -- " + item.price);
        },

        onClickItem: function(event) {
            var obj = this.priceList.find(item => item.uuid === event.srcElement.id);
            if (obj) {
                if (obj.isGroup) {
                    this.parent = obj.uuid;
                }
            }
        },
        onClickBack: function(event) {
            if (this.parent === this.enptyParent) return;

            var obj = this.priceList.find(item => item.uuid === event.srcElement.id);
            if (obj)
                this.parent = obj.parent;
            else
                this.parent = this.emptyParent;
        },

        getMenu: function () {
            var userName = 'user';
            var userPass = 'password';
            var token = btoa(userName + ':' + userPass);
            axios
                .get("http://127.0.0.1/st_test_oduvan_834/hs/emenu/api/v1/priceList", {
                    //withCredentials: true,
                    crossDomain: true,
                    headers: {
                        //Authorization: 'Basic ${token}',
                        Accept: 'application/json; indent=4',
                        'Content-Type': 'application/json'
                    },
                    auth: {
                        username: userName,
                        password: userPass
                    }
                })
                //.then(response => console.log(response))
                .then(response => {
                    this.priceList = response.data.items;
                    this.categories = response.data.categories;
                    this.parent = this.emptyParent;
                })

                .catch(e => this.errors.push(e));
        }
    },

    beforeMount() {
        this.init();
    }
});