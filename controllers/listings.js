const Listing = require("../models/listing.js"); 
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) =>{ 
    // const {query} = req.body.searchInput;
    const searchTerm = req.query.searchInput || "";

    const allListings = searchTerm ? await Listing.find({
        $or: [
            { title: { $regex: searchTerm, $options: "i" } },
            { location: { $regex: searchTerm, $options: "i" }},
            { country: { $regex: searchTerm, $options: "i" }},
  ]
    }) : await Listing.find({});

    // if(searchTerm) {
    //     console.log("inside loop:", searchTerm);
    //     console.log(allListings);
    // } 
    res.render("listings/index.ejs", {allListings, searchTerm});
};

module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");
    if (!listing) {
        req.flash("error","Listing you have searched for doesn't exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", {viewlisting: listing});

};

module.exports.createListing = async (req, res) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
        })
    .send();
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};

    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success","New listing created successfully!");
    res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error","Listing you have searched for doesn't exist");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_250,w_400");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    let {id} = req.params;
    let updatedListing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    if (typeof req.file != "undefined") {
        let url = req.file.path;
        let filename = req.file.filename
        updatedListing.image = {url, filename};
        await updatedListing.save();
    }
    
    req.flash("success","Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing deleted successfully!");
    res.redirect("/listings");
}