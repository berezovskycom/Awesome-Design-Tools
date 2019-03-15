const fs = require(`fs`);
const md = new require('markdown-it')('commonmark');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;


let indexPage = ``;

const someBanner = `
	<div class="banner">
		Hello there!
	</div> 
`;
	
const config = {
	markdownFile: `./README.md`,
	filenameForMarkdownHtml: `main.html`,
	index: `./docs/index.html`,
	components: [
		`components/header.html`,
		`components/main.html`,
		`components/footer.html`
	],
};

const writeHtml = (html) => {
	const { filenameForMarkdownHtml } = config;
	fs.writeFile(`components/${filenameForMarkdownHtml}`, html, function(err, data) {
	  if (err) console.log(err);
	  console.log(`transpiling md to html.`);
	  createIndexPage();
	});
}

const readMarkdown = new Promise((resolve, reject) => {
	const { markdownFile } = config;
	fs.readFile(markdownFile, (err, data) => {
		console.log(`getting md file`);
		const mdData = data.toString();
		const html = md.render(mdData);
		resolve(html);
	})
});

const readFile = (fileName) => (
	new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf8', function (error, data) {
      if (error) return reject(error);
      indexPage += data;
      console.log(`pasting ${fileName}`);
      resolve();
    })
  })
);

async function createIndexPage() {
	const { components, index } = config;
	await readFile(components[0]);
	await readFile(components[1]);
	await readFile(components[2]);
	await fs.writeFile(index, indexPage, (err, data) => {
	  if (err) console.log(err);
	  console.log(`wrote index page`);
	})
}

const parseTweaks = (html) => {
		const dom = new JSDOM(html);
		const { document } = dom.window;

		const banner = document.createElement('div');
		banner.classList.add('banner');
		banner.innerHTML = `
			<a href="#">Hey</a> I'm a banner!
		`;
		const bannerParent = document.querySelector('.userflow-tools');
		bannerParent.appendChild(banner);

		const navListItems = document.querySelectorAll('.nav li a');
		navListItems.forEach(item => {
			const oldHref = item.href;
			item.href = `#${oldHref.split(`#`)[1]}`;
		})


		const categoryTitles = document.querySelectorAll('body > h3');
		categoryTitles.forEach(title => title.id = title.innerHTML.toLowerCase().split(' ').join('-'))

		return document.documentElement.outerHTML;
}

Promise.all([readMarkdown])
	.then(res => parseTweaks(res))
	.then(res => writeHtml(res));
