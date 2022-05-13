//jshint esversion 6

const express = require("express");
const bodyparser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
let items = ["Buy Food", "Cook Food", "Eat Food"];
let workItems = [];

app.set('view engine', 'ejs');

app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://amm:_Firie_2_@cluster0.soqgq.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const  Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
name: "Wellcome to todolist!"
});


const item2 = new Item ({
name: "Hit the + button to add new item."
});

const item3 = new Item ({
name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

//Rendering database item in todolist APP.
app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("succsesfully saved default items to DB.");
        }
      });
      res.redirect("/");
    } else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

//using crfeatging withen express route parameters
app.get("/:customListName", function(req, res){
const customListName = _.capitalize(req.params.customListName);

List.findOne({name: customListName}, function(err, foundList){
if (!err){
  if (!foundList){
//Create a new list
  const list = new List({
    name: customListName,
    items: defaultItems
  });
  list.save();
  res.redirect("/" + customListName);
} else {
//Shaw an existingblist
res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
  }
}
});


});
//Adding Data
app.post("/", function(req, res) {

const itemName = req.body.newItem;
const listName = req.body.list;

const item = new Item ({
  name: itemName
});

if (listName === "Today"){
  item.save();
  res.redirect("/");
} else {
List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  });
}
});

app.post("/delete", function(req, res){
const checkedItemId = (req.body.checkbox);
const listName = req.body.listName;

if (listName === "Today") {
  Item.findByIdAndRemove(checkedItemId, function(err){
    if (!err) {
      console.log("succsesfully deleted checked item.");
      res.redirect("/");
    }
  });
} else {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
    if (!err){
      res.redirect("/" + listName);
    }
  });
}

});


app.post("/work", function(req, res) {
res.redirect("/");
});


app.get("/about", function(req, res){
  res.render("about");
});

app.get("/about", function(req, res) {
res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});
