const fs = require("fs");
const esprima = require("esprima");
const path = require("path");
const axios = require("axios");
require("dotenv").config();

const isJavaScriptFile = (fileName) => path.extname(fileName) === ".js";

const isNodeModuleDir = (filePath) => filePath.includes("node_modules");

const extractFunctionData = (filename) => {
  const code = fs.readFileSync(filename, "utf8");
  try {
    esprima.parseScript(code, { range: true }, function (node) {
      if (node.type === "FunctionDeclaration") {
        const newFunc = new Func(
          node.id.name,
          node.params.map((param) => param.name),
          code.substring(node.body.range[0], node.body.range[1])
        );
        functions.push(newFunc);
      } else if (
        node.type === "VariableDeclarator" &&
        node.init &&
        node.init.type === "ArrowFunctionExpression"
      ) {
        const newFunc = new Func(
          node.id.name,
          node.init.params.map((param) => param.name),
          code.substring(node.init.body.range[0], node.init.body.range[1])
        );
        functions.push(newFunc);
      }
    });
  } catch (e) {
    console.log(`Something went wrong parsing file ${filename}`);
  }
};

const readFilesRecursively = (directoryPath) => {
  const fileNames = fs.readdirSync(directoryPath);
  fileNames.forEach((fileName) => {
    const filePath = path.join(directoryPath, fileName);
    const stat = fs.statSync(filePath);
    if (ignorePaths.includes(filePath)) return;
    if (visited.has(filePath)) return;
    visited.add(filePath);
    if (stat.isFile() && isJavaScriptFile(fileName)) {
      extractFunctionData(filePath);
    }
    if (stat.isDirectory() && !isNodeModuleDir(filePath)) {
      readFilesRecursively(filePath);
    }
  });
};

class Func {
  constructor(name, args, body) {
    this.name = name;
    this.args = args;
    this.body = body;
  }

  toString() {
    return `
      name: ${this.name},
      args: ${this.args},
      body: ${this.body}
    `;
  }
}

const generateDocs = async (func) => {
  const messages = [
    {
      role: "system",
      content: `
        Given a function in format: 
        
        {
          name: <function name>,
          args: <[arg1, arg2, ... ]>,
          body: <function body>
        }

        Write descriptive documentation in the html format:
        <p class="documentation">{documentation}<p>
        <p class="function-name">{function name}<span class="arguments">({arg1}, {arg2}, ...)<span><p>
        <do not include function body>

        <documentation>: avoid using JavaScript built-in documentation style, 
        instead include a brief description what the function returns, what the
        function requires as preconditions/invariants, what exceptions the function
        raises (if applicable) 
      `,
    },
    {
      role: "assistant",
      content: `
        ${func.toString()}
      `,
    },
  ];
  const response = await openai.post("/chat/completions", {
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: 0,
    max_tokens: 2000,
  });
  return response.data.choices[0].message.content;
};

const rootDirectory = __dirname;
const ignorePaths = [
  path.join(__dirname, "index.js"),
  path.join(__dirname, "node_modules"),
];
const functions = [];
let visited = new Set();
const openai = axios.create({
  baseURL: "https://api.openai.com/v1",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPEN_AI_API_KEY || "<api-key>"}`,
  },
});

async function main() {
  readFilesRecursively(rootDirectory);
  let docs = functions.map(async (func) => generateDocs(func));
  docs = await Promise.all(docs);
  console.log(JSON.stringify(docs));
}

main();
