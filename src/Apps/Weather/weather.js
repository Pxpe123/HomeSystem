async function weatherInit() {
  let city = await getAppSettings("weather", "City");
  console.log(city);
}
