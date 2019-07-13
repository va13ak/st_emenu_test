//import { parameters as config } from './config.js';

Vue.component('menu-item', {
    props: ['item'],
    template: ''
});

var app = new Vue({
    el: "#app",

    data: {
        emptyParent: '00000000-0000-0000-0000-000000000000',
        swiperSlides: [],
        priceList: [],
        basket: [],
        parentId: null,
        errors: [],
        priceListImages: {},
        currentOrderId: null,
        currentOrderDate: null,
    },

    computed: {
        currentItems: function () {
            return this.priceList
                        .filter(item => item.parent_id === this.parentId)
                        .sort((a, b) => (a.isGroup === b.isGroup) 
                                        ? (a.name > b.name ? 1 : -1)
                                        : (a.isGroup ? -1 : 1))
        },

        basketTotal: function () {
            if (this.basket && this.basket.length)
                return this.basket.reduce((accumulator, item) => accumulator + item.sum, 0);
            else
                return 0;
        }

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
            var obj = this.priceList.find(item => item.id === event.srcElement.id);
            if (obj) {
                if (obj.isGroup) {
                    this.parentId = obj.id;
                } else {
                    this.addItemToBasket(obj);
                }
            }
        },

        onRemoveFromBasketClick: function(event) {
            var obj = this.basket.find(item => item.row_id == event.srcElement.parentElement.id);
            if (obj) {
                //this.basket.splice(this.basket.indexOf(obj), 1);
                obj.count = 0;
                this.updateBasketItemSum(obj);
            }
        },
        
        onIncBasketClick: function(event) {
            var obj = this.basket.find(item => item.row_id == event.srcElement.parentElement.id);
            if (obj) {
                obj.count += 1;
                this.updateBasketItemSum(obj);
            }
        },

        onDecBasketClick: function(event) {
            var obj = this.basket.find(item => item.row_id == event.srcElement.parentElement.id);
            if (obj)
                if (obj.count > 1)
                    obj.count -= 1;
                else
                    obj.count = 0;
                this.updateBasketItemSum(obj);
        },

        onClickBack: function(event) {
            if (this.parentId === this.emptyParent) return;

            var obj = this.priceList.find(item => item.id === event.srcElement.id);
            if (obj)
                this.parentId = obj.parent_id;
            else
                this.parentId = this.emptyParent;
        },

        addItemToBasket: function(priceListItem) {
            if (priceListItem.isGroup) return;

            var basketItem = this.basket.find(item => item.id === priceListItem.id);
            console.log(basketItem);
            if (basketItem) {
                console.log("basket item found")
                basketItem.count += 1;
                basketItem.sum += priceListItem.price;
                basketItem.price = priceListItem.price;
            } else {
                console.log("new basket item created")
                basketItem = {
                    row_id: this.basket.length,
                    id: priceListItem.id,
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
            axios
                .get(this.baseUrl + "/hs/emenu/api/v1/priceList", {
                })
                .then(response => {
                    this.priceList = response.data.items;
                    this.categories = response.data.categories;
                    this.parentId = this.emptyParent;
                })

                .catch(e => this.errors.push(e));
        },

        sendOrder: function () {
            console.log(basket);
            console.log(this.basket.filter(item => item.count != 0));
            var respData = {
                order_id: this.currentOrderId,
                order_date: this.currentOrderDate,
                items: this.basket.filter(item => item.count != 0)
            }
            axios
                .post(this.baseUrl + "/hs/emenu/api/v1/updateOrder", respData)
                //.then(response => console.log(response))
                .then(response => {
                    console.log(response);
                    this.currentOrderId = response.data.order_id;
                    this.currentOrderDate = response.data.order_date;
                })

                .catch(e => this.errors.push(e));

        },

        onClickSendOrder: function() {
            this.sendOrder();
        }
    },

    beforeMount() {
        var getUrl = window.location;
        this.baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
        this.init();
    }
});