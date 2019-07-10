//import { parameters as config } from './config.js';

var app = new Vue({
    el: "#app",

    data: {
        emptyParent: '00000000-0000-0000-0000-000000000000',
        swiperSlides: [],
        priceList: [],
        basket: [],
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
            for (let i = 0; i < 10; i++) {
                this.swiperSlides.push({
                    id: i,
                    name: `Slide ${(i + 1)}`,
                    image: `image${(i + 1)}.jpg`
                })
            }
            this.getMenu();
        },

        getItemRepresentation: function (item) {
            return "(" + item.code + ") " + item.name + (item.isGroup ? "" : " -- " + item.price);
        },

        getBasketItemRepresentation: function(item) {
            return "(" + item.code + ") " + item.name + " --- " + item.count + "x" + item.price + " : " + item.sum;
        },

        onClickItem: function(event) {
            var obj = this.priceList.find(item => item.uuid === event.srcElement.id);
            if (obj) {
                if (obj.isGroup) {
                    this.parent = obj.uuid;
                } else {
                    this.addItemToBasket(obj);
                }
            }
        },

        onRemoveFromBasketClick: function(event) {
            var obj = this.basket.find(item => item.rowId == event.srcElement.parentElement.id);
            if (obj) {
                //this.basket.splice(this.basket.indexOf(obj), 1);
                obj.count = 0;
                this.updateBasketItemSum(obj);
            }
        },
        
        onIncBasketClick: function(event) {
            var obj = this.basket.find(item => item.rowId == event.srcElement.parentElement.id);
            if (obj) {
                obj.count += 1;
                this.updateBasketItemSum(obj);
            }
        },

        onDecBasketClick: function(event) {
            var obj = this.basket.find(item => item.rowId == event.srcElement.parentElement.id);
            if (obj)
                if (obj.count > 1)
                    obj.count -= 1;
                else
                    obj.count = 0;
                this.updateBasketItemSum(obj);
        },

        onClickBack: function(event) {
            if (this.parent === this.enptyParent) return;

            var obj = this.priceList.find(item => item.uuid === event.srcElement.id);
            if (obj)
                this.parent = obj.parent;
            else
                this.parent = this.emptyParent;
        },

        addItemToBasket: function(priceListItem) {
            if (priceListItem.isGroup) return;

            var basketItem = this.basket.find(item => item.uuid === priceListItem.uuid);
            console.log(basketItem);
            if (basketItem) {
                console.log("basket item found")
                basketItem.count += 1;
                basketItem.sum += priceListItem.price;
                basketItem.price = priceListItem.price;
            } else {
                console.log("new basket item created")
                basketItem = {
                    rowId: this.basket.length,
                    uuid: priceListItem.uuid,
                    name: priceListItem.name,
                    count: 1,
                    price: priceListItem.price,
                    sum: (priceListItem.price * 1)
                }
                this.basket.push(basketItem);
            }
        },

        updateBasketItemSum: function(obj) {
            if (obj) {
                obj.sum = obj.price * obj.count;
            }
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
        },

        sendOrder: function () {

        },

        onClickSendOrder: function() {

        }
    },

    beforeMount() {
        this.init();
    }
});