const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folders
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🚀 Serve React static files
app.use(express.static(path.join(__dirname, "build")));

// Products routes
const productRouter = require("./routes/products");
app.use("/product", productRouter);

// Hero Banner routes
const heroBannerRouter = require("./routes/heroBanner");
app.use("/herobanner", heroBannerRouter);

// Products Banner routes
const productBannerRouter = require("./routes/productBanner");
app.use("/productbanner", productBannerRouter);

// Home Slider routes
const homeSliderRouter = require("./routes/homeCardsSlider");
app.use("/homeslider", homeSliderRouter);

// Body Slider routes
const bodySliderRouter = require("./routes/bodySlider");
app.use("/bodyslider", bodySliderRouter);

// Home Content Slider routes
const homeContentSliderRouter = require("./routes/homeContentSlider");
app.use("/homecontentslider", homeContentSliderRouter);

// Home Content Slider routes
const categoryRouter = require("./routes/categoryRouter");
app.use("/category", categoryRouter);

// Home Content Slider routes
const sectionOneRouter = require("./routes/sectionOneRouter");
app.use("/sectionone", sectionOneRouter);

// section two
const sectionTwoRouter = require("./routes/sectionTwoRouter");
app.use("/sectiontwo", sectionTwoRouter);

// section three
const sectionThreeRouter = require("./routes/sectionThreeRouter");
app.use("/sectionthree", sectionThreeRouter);

// section four
const sectionFourRouter = require("./routes/sectionFourRouter");
app.use("/sectionfour", sectionFourRouter);

// section five
const sectionFiveRouter = require("./routes/sectionFiveRouter");
app.use("/sectionfive", sectionFiveRouter);

// section six
const sectionSixRouter = require("./routes/sectionSixRouter");
app.use("/sectionsix", sectionSixRouter);

// ###########################################################
// ###########################################################
//  Products
// ###########################################################
// ###########################################################

// products
const productsRouter = require("./routes/productsRouter");
app.use("/products", productsRouter);

const productsSectionOneRouter = require("./routes/productsSectionOneRouter");
app.use("/productssectionone", productsSectionOneRouter);

const productsSectionTwoRouter = require("./routes/productsSectionTwoRouter");
app.use("/productssectiontwo", productsSectionTwoRouter);

const productsSectionThreeRouter = require("./routes/productsSectionThreeRouter");
app.use("/productssectionthree", productsSectionThreeRouter);

const productsSectionFourRouter = require("./routes/productsSectionFourRouter");
app.use("/productssectionfour", productsSectionFourRouter);

const productsSectionFiveRouter = require("./routes/productsSectionFiveRouter");
app.use("/productssectionfive", productsSectionFiveRouter);

const productsSectionSixRouter = require("./routes/productsSectionSixRouter");
app.use("/productssectionsix", productsSectionSixRouter);

const productsSectionSevenRouter = require("./routes/productsSectionSevenRouter");
app.use("/productssectionseven", productsSectionSevenRouter);

const productsSectionNineRouter = require("./routes/productsSectionNineRouter");
app.use("/productssectionnine", productsSectionNineRouter);

const productsSectionTenRouter = require("./routes/productsSectionTenRouter");
app.use("/productssectionten", productsSectionTenRouter);

// ###########################################################
// ###########################################################
//  Sub Category
// ###########################################################
// ###########################################################
const subCategoryRouter = require("./routes/subCategoryRouter");
app.use("/sub_category", subCategoryRouter);

const subcategorySectionZeroRouter = require("./routes/subCategorySectionZeroRouter");
app.use("/subcategorysectionzero", subcategorySectionZeroRouter);

const subcategorySectionOneRouter = require("./routes/subCategorySectionOneRouter");
app.use("/subcategorysectionone", subcategorySectionOneRouter);

const subcategorySectionTwoRouter = require("./routes/subCategorySectionTwoRouter");
app.use("/subcategorysectiontwo", subcategorySectionTwoRouter);

const subcategorySectionThreeRouter = require("./routes/subCategorySectionThreeRouter");
app.use("/subcategorysectionthree", subcategorySectionThreeRouter);

const subcategorySectionFourRouter = require("./routes/subCategorySectionFourRouter");
app.use("/subcategorysectionfour", subcategorySectionFourRouter);

const subcategorySectionFiveRouter = require("./routes/subCategorySectionFiveRouter");
app.use("/subcategorysectionfive", subcategorySectionFiveRouter);

// ###########################################################
// ###########################################################
//  Projects
// ###########################################################
// ###########################################################
const projectCrewRouter = require("./routes/projectCrewRouter");
app.use("/projectcrew", projectCrewRouter);

const projectCycleRouter = require("./routes/projectCycleRouter");
app.use("/projectCycle", projectCycleRouter);

const projectClientsLogosRouter = require("./routes/projectClientsLogosRouter");
app.use("/clientslogos", projectClientsLogosRouter);

const projectProudctsRouter = require("./routes/projectProudctsRouter");
app.use("/project_product", projectProudctsRouter);

const projectPreProjectsRouter = require("./routes/projectPreProjectsRouter");
app.use("/projectpreprojects", projectPreProjectsRouter);

const projectTeamMembersRouter = require("./routes/projectTeamMembersRouter");
app.use("/projectteammembers", projectTeamMembersRouter);

const projectQuestionsRouter = require("./routes/projectQuestionsRouter");
app.use("/projectquestions", projectQuestionsRouter);

const projectBlogsRouter = require("./routes/projectBlogsRouter");
app.use("/projectblogs", projectBlogsRouter);

// Home Content Slider routes
const projectContentSliderRouter = require("./routes/projectContentSliderRouter");
app.use("/projectcontentslider", projectContentSliderRouter);

// Home Content Slider routes
const projectGridContentRouter = require("./routes/projectGridContentRouter");
app.use("/projegridctcontent", projectGridContentRouter);

// ###########################################################
// ###########################################################
//  Front-end Render
// ###########################################################
// ###########################################################

// Home Content Slider routes
const communityRouter = require("./routes/communityRouter");
app.use("/community", communityRouter);

const communityOnePostRouter = require("./routes/communityOnePostRouter");
app.use("/communityonepost", communityOnePostRouter);

const communityPostesRouter = require("./routes/communityPostesRouter");
app.use("/communityposts", communityPostesRouter);

// ###########################################################
// ###########################################################
//  Front-end Render
// ###########################################################
// ###########################################################

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Start server with 5000
app.listen(5000, () => console.log("Server running on http://localhost:5000"));
