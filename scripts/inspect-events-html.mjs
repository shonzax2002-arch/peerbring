const eventsUrl = "https://www.uottawa.ca/campus-life/events-all";
const proxy = "https://api.cors.syrins.tech/?url=" + encodeURIComponent(eventsUrl);
const html = await (await fetch(proxy)).text();
const doc = new DOMParser().parseFromString(html, "text/html");

const headlines = doc.querySelectorAll("h2.headline a, h2.headline--three-up-articles-item a");
console.log("headlines", headlines.length);
headlines.forEach((a, i) => {
  if (i >= 5) return;
  const card = a.closest("article");
  const time = card?.querySelector("time, .date, .field--name-field-date, p");
  console.log(i, a.textContent.trim().slice(0, 50), time?.textContent?.trim()?.slice(0, 40));
});
