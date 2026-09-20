# Huffman Code Lab

An interactive educational website for learning how **Huffman coding** compresses text using frequency analysis, greedy tree construction, and prefix-free binary codes.

**Live website:** [mohammed-gamal.github.io/huffman-code](https://mohammed-gamal.github.io/huffman-code/)

## About the project

Huffman Code Lab turns the algorithm into a visual learning experience. Instead of only showing the final binary codes, it demonstrates how the frequency table, priority queue, merge decisions, Huffman tree, encoding, and decoding are connected.

The website is suitable for students studying:

- Data structures and algorithms
- Greedy algorithms
- Binary trees
- Priority queues and min-heaps
- Lossless data compression
- Prefix-free binary codes

## Website pages

### 1. Start page

The landing page introduces the central idea behind Huffman coding:

> Frequently occurring symbols receive shorter binary codes, while less frequent symbols receive longer codes.

It also presents the three main stages of the algorithm:

1. Count the frequency of every symbol.
2. Repeatedly merge the two least frequent nodes.
3. Trace root-to-leaf paths to generate binary codes.

### 2. Explanation page

The explanation page provides a structured walkthrough of the algorithm, including:

- The problem with fixed-width character codes
- The greedy strategy used by Huffman coding
- Min-heap and binary-tree construction
- A complete worked example using <code>AAAAAABBBCCD</code>
- Prefix-free codes and unambiguous decoding
- Encoding and decoding pseudocode
- Time and space complexity
- Practical limitations of Huffman coding
- The difference between a displayed bit string and a real compressed file

### 3. Interactive simulator

The simulator allows users to enter their own text and inspect the generated Huffman representation in real time.

Its features include:

- Custom text input of up to 500 characters
- Ready-to-use example inputs
- Automatic symbol-frequency calculation
- Deterministic Huffman-tree construction
- Animated min-heap merge steps
- Manual step-by-step execution
- Adjustable animation speed
- Interactive tree and heap views
- Left-edge <code>0</code> and right-edge <code>1</code> labels
- Generated Huffman code table
- Encoded binary output
- One-click copying of the encoded bits
- Automatic decoding and round-trip verification
- Original UTF-8 size and encoded-payload comparison
- Payload-saving percentage

> The displayed saving compares the Huffman payload with the original UTF-8 representation. A real compressed file would also need to store tree or code-table metadata and pack the bits into bytes.

## How the simulator works

Given an input string, the simulator:

1. Counts how frequently each symbol appears.
2. Creates one leaf node for every unique symbol.
3. Places the nodes into a min-priority queue.
4. Removes the two nodes with the smallest frequencies.
5. Combines them into a new parent node.
6. Inserts the parent back into the priority queue.
7. Repeats until only the root node remains.
8. Assigns <code>0</code> to every left edge and <code>1</code> to every right edge.
9. Uses each root-to-leaf path as the corresponding symbol's code.
10. Encodes the input and decodes it again to verify the result.

## Complexity

Let:

- <code>n</code> be the number of symbols in the input.
- <code>k</code> be the number of unique symbols.

| Operation | Complexity |
|---|---:|
| Count symbol frequencies | <code>O(n)</code> |
| Build the Huffman tree | <code>O(k log k)</code> |
| Generate the code table | <code>O(k)</code> |
| Encode the input | <code>O(n)</code> |
| Decode the bit sequence | <code>O(n)</code> |
| Tree and code-table space | <code>O(k)</code> |

## Technologies

The website is built without external frameworks:

- HTML5
- CSS3
- Vanilla JavaScript
- SVG for the Huffman-tree visualization
- GitHub Pages for hosting

Because the project is entirely client-side, it does not require a server, database, package installation, or build process.

## Project files

| File | Purpose |
|---|---|
| <code>index.html</code> | Start page and visual introduction |
| <code>explanation.html</code> | Detailed algorithm explanation |
| <code>simulator.html</code> | Interactive simulation interface |
| <code>simulator.js</code> | Huffman algorithm, animation, encoding, decoding, and visualization logic |
| <code>styles.css</code> | Shared design, responsive layout, and component styles |

## Run locally

1. Clone the repository:

   ~~~bash
   git clone https://github.com/mohammed-gamal/huffman-code.git
   ~~~

2. Open the project directory:

   ~~~bash
   cd huffman-code
   ~~~

3. Open <code>index.html</code> in a web browser.

No installation is required.

For a local development server, you can alternatively run:

~~~bash
python -m http.server 8000
~~~

Then visit [http://localhost:8000](http://localhost:8000).

## Educational note

Huffman coding produces an optimal symbol-by-symbol prefix code when the symbol frequencies are known. Different valid trees and binary codes may be produced when symbols have equal frequencies, but their total weighted cost can still be optimal.

## Author

Developed by **Mohamed Gamal** as an interactive resource for understanding Huffman coding and fundamental computer science concepts.

## License

No license has been specified yet. If you want other people to reuse, modify, or distribute the project, add an appropriate <code>LICENSE</code> file to the repository.
