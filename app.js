var express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	methodOverride = require("method-override"),
	expressSanitizer = require("express-sanitizer");
//setting up mongoose
mongoose.connect(process.env.DATABASEURL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true
});
//default render file to be ejs
app.set("view engine", "ejs");
app.use(express.static("public")); //for additional css files in pubkic directory
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//setting Schema
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type:Date, default: Date.now} // to pick up today's date
});
//making the object
var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
// 	title: "Test Blog",
// 	image: "https://images.unsplash.com/photo-1589967899887-179610bb5f63?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1000&q=60",
// 	body: "Hello This is a BLOG Post!"
// })

//INDEX Route
app.get("/", function(req, res){
	res.redirect("/blogs");
})

app.get("/blogs", function(req,res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log(err);
		} else {
			res.render("index",{blogs: blogs});
		}
	});
});

//NEW Route
app.get("/blogs/new",function(req, res){
	res.render("new");
});

//CREATE Route
app.post("/blogs", function(req, res){
	//create blog
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("new");
		} else {
			//redirect
			res.redirect("/blogs");
		}
	});
});

//SHOW Route
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("show", {blog: foundBlog});
		}
	});
});

//EDIT Route
app.get("/blogs/:id/edit", function(req,res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blog");
		}else{
			res.render("edit", {blog: foundBlog});
		}
	});
});

//UPDATE Route
app.put("/blogs/:id", function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id);
		}
	});
});	

//DESTROY or DELETE Route
app.delete("/blogs/:id", function(req,res){
	//destroy blog
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		} else {
			//redirect
			res.redirect("/blogs");
		}
	});
});

//setting up port
var port = process.env.PORT || 3000;
app.listen(port, function(){
	console.log("Blog Server has Started!");
})
