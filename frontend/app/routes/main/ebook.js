import Ember from 'ember';

export default Ember.Route.extend({
  queryData: Ember.computed(function() {
    return []
  }),
  isBookFound: false,

  model(params) {
    return this.get('store').findRecord('book', params.id);
  },
  setupController: function(controller, model) {
    //this takes the route's model and allows the template to gain access
      this._super(controller, model);
      controller.set('model', model);
      controller.set('isBook', true);
      controller.set('isBookFound',false);
      controller.set('queryData',this.get('queryData'));
  },
  actions: {
    async saveBook(title,isbn,author,price,checkoutDate,dueDate) {
      console.log('book '+title+" "+isbn+" "+author+" "+price);
      var currentBook;
      var store = this.get('store');
      let model = this.modelFor(this.routeName);

      if (model == null) {
        let newbook = await this.get('store').createRecord('book', {
          book_name: title,
          isbn: isbn,
          author: author,
          price: price,
          checkout_date: checkoutDate,
          due_date: dueDate
      }).save()

        this.send('goToBookList');
    } else {
      let book = await store.findRecord('book',model.id);

      book.set('book_name', title)
      book.set('isbn',isbn)
      book.set('author', author)
      book.set('price', price)
      book.set('checkout_date', checkoutDate)
      book.set('due_date', dueDate)
      await book.save()

      this.send('goToBookList');
    }
  },
  findBook(title,isbn,author) {
    console.log('in findbook route');
    var queryString = "";
    if (title) {
      queryString += "intitle:"+title;
    }
    if (isbn) {
      queryString += "+isbn:"+isbn;
    }
    if (author) {
      queryString += "inauthors:"+author;
    }
    console.log("queryString "+queryString);
    var queryData = this.get('queryData');
    var $this = this;
    return new Ember.RSVP.Promise(function(resolve,reject) {
      Ember.$.ajax({
        url: "https://www.googleapis.com/books/v1/volumes?q="+queryString,
        dataType: "json",
        success: function(data,status,jqXHR) {
          $this.set('isBookFound',true);
          console.log("ajax status "+status);
          if (data.items != undefined) {
            data.items.forEach(function(item,index) {
              let bookObj = {};
              bookObj.title = item.volumeInfo.title;
              console.log('title is '+item.volumeInfo.title);
              bookObj.authors = []
              if (item.volumeInfo.authors == null) {
                //skip
              } else {
                item.volumeInfo.authors.forEach(function(author,index1) {
                  console.log('authors are '+author);
                  bookObj.authors.pushObject(author);
                });
              }
              bookObj.isbn = item.volumeInfo.industryIdentifiers[0].identifier;
              console.log('isbn is '+item.volumeInfo.industryIdentifiers[0].identifier);
              console.log("bookObj "+JSON.stringify(bookObj));
              queryData.pushObject(bookObj);
            });
        } else {
          alert('No books found matching your search!');
        }
          resolve()
        },
        error: function (request, textStatus, error) {
          console.log('error '+error);
          reject(error);
        }
      });
    });
  },
    goToBookList() {
      this.transitionTo('main.book');
    }
  }
});
