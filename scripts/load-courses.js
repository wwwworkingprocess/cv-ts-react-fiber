const fs = require("fs");
const https = require("https");
//
const ids = [50522, 3792262, 2034156, 1594488, 1329100, 3138058, 851712, 2365628, 995016, 159070];
const SERVICE_PATH = `https://www.udemy.com/api-2.0/courses/`;
const SERVICE_QUERY = `/?fields[course]=title,headline,description,num_lectures,num_quizzes,url,image_240x135`;
//
const options = { hostname: "www.udemy.com", port: 443, path: "", method: "GET", };
//
const load_one = (courseId) => new Promise((resolve, rej) => {
  const query = {
    ...options,
    path: `${SERVICE_PATH}${courseId}${SERVICE_QUERY}`,
  };
  //
  const chunks = [];
  const req = https.request(query, (res) => {
    res.on("data", (d) => chunks.push(d));
    res.on('end', (d) => resolve(chunks.join('')))
  });
  //
  req.on("error", (error) => rej(error));
  //
  req.end();
});
//
const loadCourses = async (ids) => {
  const results = [];
  //
  for (const id of ids) {
    const course = await load_one(id);
    //
    results.push(JSON.parse(course));
  }
  //
  fs.writeFileSync("courses.json", JSON.stringify(results, null, 4));
}
//
//
//
loadCourses(ids);
