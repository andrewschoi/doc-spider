# DocSpider

AutoDoc is a tool for automatically generating documentation for JavaScript source code.

## Features

- **Upload**: Zip your source code and upload it.
- **Process**: DFS performed on folder hierarchy targeting .js files.
- **Analysis**: Function headers, arguments, and body accessed using AST.
- **Generate**: Function documentation generated through OpenAI requests.

## Limitations

- Currently, DocSpider only supports JavaScript code.

## Future Improvements

- Context awareness: Consider dependencies between functions when generating documentation.

## Installation

```sh
# Clone the repository
git clone git@github.com:andrewschoi/doc-spider.git

# Navigate into the directory
cd doc-spider

# Install dependencies
npm install

# Start the application
node server.js
```
