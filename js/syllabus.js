// GATE CSE 2027 — full syllabus map (official GATE 2027 CS syllabus, IIT Madras) with depth guide + PYQ mapping.
//
// Hierarchy: Subject → Topic → Subtopic → points (sub-subtopics).
// d (depth):  1 = BASIC    — definitions, direct formula, 1-mark conceptual. Upar-upar se nahi, par research-level bhi nahi.
//             2 = STANDARD — saare standard PYQ types solve kar sako, numericals speed ke saath.
//             3 = DEEP     — high-frequency 2-mark area: har variation, edge case, trick master karo.
// f (PYQ frequency): H = lagbhag har saal, M = har 2-3 saal, L = kabhi-kabhi.
// pyq  = PYQ me kis type ke questions aate hain.
// skip = kya NAHI padhna (over-depth avoid karne ke liye).
// status: "revise" = pehle padh chuke ho, "partial" = kuch part hua, "new" = abhi padhna hai.

function S(n, d, f, pts, pyq, skip) { return { n, d, f, pts, pyq, skip: skip || "" }; }

const SUBJECTS = [
  // ============================ GENERAL APTITUDE ============================
  {
    id: "ga", name: "General Aptitude", status: "new", weight: "15", pyqTarget: 200,
    official: "Verbal Aptitude, Quantitative Aptitude, Analytical Aptitude, Spatial Aptitude.",
    topics: [
      { n: "Verbal Aptitude", f: "H", subs: [
        S("English grammar", 2, "H", ["Tenses, articles, prepositions, adjectives", "Subject-verb agreement", "Conjunctions, modifiers, parallelism"], "Fill in the blank / pick grammatically correct sentence (1 mark).", "Literature, rare idioms lists ratna mat."),
        S("Vocabulary", 1, "H", ["Words in context, synonyms/antonyms", "Common idioms & phrases", "Analogies of words"], "Choose word closest in meaning / fits context.", "Word lists of 3000+ words — sirf PYQ + reading se seekho."),
        S("Reading comprehension & narrative sequencing", 2, "H", ["Short passage inference (what can be inferred / assumed)", "Sentence ordering (para jumble)", "Tone / main idea"], "Passage based inference, sentence rearrangement.", ""),
      ]},
      { n: "Quantitative Aptitude", f: "H", subs: [
        S("Arithmetic", 2, "H", ["Percentages, ratio & proportion, averages, mixtures", "Time & work, pipes", "Speed-distance-time, relative speed", "Profit/loss, simple & compound interest"], "Direct numericals, often NAT.", ""),
        S("Powers, exponents, logarithms, number system", 2, "M", ["Laws of exponents & logs", "Divisibility, remainders, unit digit", "HCF/LCM"], "Simplify/compare expressions.", ""),
        S("Permutation, combination, probability", 2, "H", ["Arrangements with restrictions", "Selections, distribution basics", "Probability of events, dice/coins/cards"], "Counting & probability word problems.", "Advanced combinatorics (that's Discrete)."),
        S("Data interpretation", 2, "H", ["Bar/pie/line charts, tables", "Percentage change, ratios from graphs"], "Read graph → compute % / ratio.", ""),
        S("Mensuration & geometry", 2, "M", ["Area/perimeter/volume of standard shapes", "Triangles, circles, similarity", "Coordinate geometry basics"], "Shape based numericals.", "Heavy trigonometry."),
        S("Statistics", 1, "L", ["Mean, median, mode, range", "Standard deviation basics"], "Direct computation.", ""),
      ]},
      { n: "Analytical Aptitude", f: "H", subs: [
        S("Logic: deduction & induction", 2, "H", ["Statements & conclusions, syllogisms", "Assumptions, necessary/sufficient", "Truth-teller/liar puzzles"], "Which conclusion follows.", ""),
        S("Arrangements & numerical relations", 2, "H", ["Seating (linear/circular)", "Blood relations, ordering/ranking", "Analogy & number series"], "Puzzle with 4-6 conditions.", ""),
      ]},
      { n: "Spatial Aptitude", f: "M", subs: [
        S("Transformation of shapes", 1, "M", ["Rotation, reflection (mirror image)", "Scaling, translation"], "Which figure results after transformation.", ""),
        S("Paper folding & cutting, patterns in 2D/3D", 2, "M", ["Folding + hole punching", "Cube faces / nets", "Counting triangles/squares"], "Picture based 1-2 mark.", ""),
      ]},
    ],
  },

  // ============================ ENGINEERING MATHS ============================
  {
    id: "dm", name: "Discrete Mathematics", status: "partial", weight: "7-9", pyqTarget: 250,
    official: "Propositional and first order logic. Sets, relations, functions, partial orders and lattices. Monoids, Groups. Graphs: connectivity, matching, colouring. Combinatorics: counting, recurrence relations, generating functions.",
    topics: [
      { n: "Propositional logic", f: "H", subs: [
        S("Connectives & truth tables", 2, "H", ["¬, ∧, ∨, →, ↔ truth tables", "Tautology, contradiction, contingency", "Satisfiable vs valid"], "Is formula tautology/valid? (1-2 mark).", ""),
        S("Logical equivalences & normal forms", 2, "M", ["De Morgan, implication = ¬p∨q, contrapositive", "Functionally complete sets (NAND, NOR)", "CNF/DNF basics"], "Pick equivalent formula; functional completeness.", "Resolution theorem proving in depth."),
        S("Inference rules & arguments", 2, "M", ["Modus ponens/tollens, hypothetical syllogism", "Validity of argument"], "Does conclusion follow from premises.", ""),
      ]},
      { n: "First-order (predicate) logic", f: "H", subs: [
        S("Quantifiers & translation", 3, "H", ["∀, ∃ meaning & scope", "English ↔ FOL translation ('every', 'only', 'some')", "Negation of quantified statements"], "Correct FOL for English sentence — very frequent.", ""),
        S("Validity of FOL formulas", 3, "M", ["∀x(P∧Q) ≡ ∀xP ∧ ∀xQ; ∃ distributes over ∨", "∃x∀y → ∀y∃x (valid) but not reverse", "Counter-model technique"], "Which implication is valid.", "Formal proofs / Herbrand."),
      ]},
      { n: "Sets, relations, functions", f: "H", subs: [
        S("Sets", 1, "L", ["Power set, cartesian product, set identities", "Countable vs uncountable (basic)"], "Cardinality questions.", ""),
        S("Relations & properties", 3, "H", ["Reflexive, irreflexive, symmetric, antisymmetric, asymmetric, transitive", "Counting relations: 2^(n²), reflexive 2^(n²−n), symmetric 2^(n(n+1)/2), antisymmetric 2^n·3^(n(n−1)/2)", "Closures (reflexive/symmetric/transitive)"], "Count relations with property; check properties (NAT).", ""),
        S("Equivalence relations & partitions", 2, "H", ["Equivalence classes", "Number of equivalence relations = Bell number", "Stirling numbers of 2nd kind (basic)"], "Count equivalence relations / classes.", ""),
        S("Functions", 2, "H", ["Injective, surjective, bijective", "Counting: total n^m, 1-1 P(n,m), onto via inclusion-exclusion", "Composition & inverse properties"], "Count onto functions; properties of f∘g.", ""),
      ]},
      { n: "Partial orders & lattices", f: "M", subs: [
        S("POSET & Hasse diagram", 2, "M", ["Minimal/maximal, least/greatest, upper/lower bounds", "Total order, well order", "Topological sorting of POSET"], "Identify from Hasse diagram.", ""),
        S("Lattices", 2, "M", ["LUB/GLB (join/meet)", "Distributive, complemented, bounded lattice", "Boolean algebra as lattice"], "Is it a lattice? Is it distributive/complemented?", "Modular lattice proofs."),
      ]},
      { n: "Monoids & groups", f: "M", subs: [
        S("Algebraic structures", 2, "M", ["Closure → semigroup → monoid → group → abelian", "Identity & inverse check on custom operations"], "Given operation on set, which structure?", "Rings/fields in depth."),
        S("Groups", 2, "M", ["Order of group/element, cyclic groups, generators (φ(n))", "Subgroups, Lagrange's theorem", "Z_n, U(n) examples"], "Order of element; number of generators; subgroup possible?", "Sylow theorems, isomorphism theorems."),
      ]},
      { n: "Graph theory", f: "H", subs: [
        S("Basics & connectivity", 3, "H", ["Handshake lemma, degree sequence (Havel-Hakimi)", "Connected components, cut vertex, bridge", "Vertex/edge connectivity", "Max edges with k components; complement graph"], "Counting edges/graphs; connectivity NAT.", ""),
        S("Special graphs & trees", 2, "M", ["Complete, bipartite, regular graphs", "Euler & Hamiltonian conditions", "Planar: Euler formula v−e+f=2, e ≤ 3v−6", "Trees: n−1 edges, number of labelled trees n^(n−2)"], "Which graph is planar/Eulerian; count spanning trees.", "Hamiltonian proofs."),
        S("Matching", 2, "M", ["Maximal vs maximum matching, perfect matching", "Hall's theorem (statement)"], "Size of maximum matching.", "Matching algorithms (Hungarian)."),
        S("Colouring & covering", 3, "H", ["Chromatic number of standard graphs", "Independent set, vertex cover, edge cover, clique relations", "α + β = n, König for bipartite"], "Chromatic number / min vertex cover NAT.", "Chromatic polynomials in depth."),
      ]},
      { n: "Combinatorics", f: "H", subs: [
        S("Counting", 3, "H", ["Sum/product rule, P&C with repetition", "Stars & bars (non-negative integer solutions)", "Pigeonhole principle", "Inclusion-exclusion, derangements"], "NAT counting problems — very frequent.", ""),
        S("Recurrence relations", 3, "H", ["Forming recurrences (strings without '00', tilings)", "Solving linear homogeneous (characteristic roots)", "Non-homogeneous particular solution", "Catalan numbers"], "Form recurrence / find closed form / nth value.", ""),
        S("Generating functions", 2, "M", ["Ordinary GF of standard sequences", "Coefficient extraction", "GF ↔ sequence"], "Find sequence from GF or GF from sequence.", "Exponential GFs."),
      ]},
    ],
  },
  {
    id: "em", name: "Engineering Mathematics", status: "revise", weight: "5-7", pyqTarget: 150,
    official: "Linear Algebra: Matrices, determinants, system of linear equations, eigenvalues and eigenvectors, LU decomposition. Calculus: Limits, continuity and differentiability. Maxima and minima. Mean value theorem. Integration. Probability and Statistics: Random variables. Uniform, normal, exponential, poisson and binomial distributions. Mean, median, mode and standard deviation. Conditional probability and Bayes theorem.",
    topics: [
      { n: "Linear algebra", f: "H", subs: [
        S("Matrices & determinants", 2, "M", ["Properties of determinants", "Rank (row echelon)", "Special matrices: symmetric, skew, orthogonal, idempotent, nilpotent"], "Compute determinant/rank.", ""),
        S("System of linear equations", 2, "M", ["Consistency via rank (unique/infinite/none)", "Homogeneous systems, nullity"], "Condition on parameter for unique/no solution.", "Gauss-Jordan by hand for large matrices."),
        S("Eigenvalues & eigenvectors", 3, "H", ["Characteristic equation", "Sum = trace, product = det", "Eigenvalues of A^k, A^−1, triangular, symmetric", "Cayley-Hamilton"], "Eigenvalue NAT — almost every year.", "Diagonalization proofs, Jordan form."),
        S("LU decomposition", 2, "L", ["Doolittle method (L unit lower)", "Using LU to solve Ax=b"], "Find entry of L or U.", ""),
      ]},
      { n: "Calculus", f: "M", subs: [
        S("Limits, continuity, differentiability", 2, "M", ["Standard limits, L'Hospital", "Continuity/differentiability at a point (|x|, piecewise)"], "Evaluate limit (NAT).", "ε-δ proofs."),
        S("Maxima/minima & mean value theorems", 2, "M", ["First/second derivative test, closed interval extremes", "Rolle's, Lagrange MVT"], "Max value on interval / MVT c value.", "Multivariable maxima."),
        S("Integration", 2, "M", ["Standard integrals, substitution, by parts", "Definite integral properties (odd/even, f(a+b−x))"], "Evaluate definite integral.", "Multiple integrals."),
      ]},
      { n: "Probability & statistics", f: "H", subs: [
        S("Probability, conditional probability, Bayes", 3, "H", ["Axioms, independence vs mutually exclusive", "Conditional probability, total probability", "Bayes theorem"], "Word problems — frequent NAT.", ""),
        S("Random variables & expectation", 3, "H", ["PMF/PDF/CDF", "E[X], Var(X), linearity of expectation", "Indicator variable trick"], "Expected value NAT (often with linearity).", "Moment generating functions."),
        S("Distributions", 2, "M", ["Uniform, binomial, Poisson, exponential (memoryless), normal", "Mean & variance of each"], "Apply correct distribution.", "Deriving distributions."),
        S("Descriptive statistics", 1, "L", ["Mean, median, mode, SD"], "Direct computation.", ""),
      ]},
    ],
  },

  // ============================ DIGITAL LOGIC ============================
  {
    id: "dl", name: "Digital Logic", status: "revise", weight: "4-6", pyqTarget: 150,
    official: "Boolean algebra; minimization: algebraic, Karnaugh map, tabular method (Quine–McCluskey) [named in 2027]. Combinational and sequential circuits. Number representations and computer arithmetic (fixed and floating point).",
    topics: [
      { n: "Boolean algebra & minimization", f: "H", subs: [
        S("Boolean algebra", 2, "M", ["Laws, duality, consensus theorem", "SOP/POS, minterms/maxterms", "Number of boolean functions (2^(2^n)), self-dual functions"], "Simplify / count functions.", ""),
        S("K-maps", 3, "H", ["2-5 variable K-maps", "Prime implicants, essential PIs", "Don't cares"], "Count PIs/EPIs; minimal expression.", "6-variable K-maps."),
        S("Quine-McCluskey (tabular) — NEW 2027", 2, "L", ["Grouping by number of 1s", "Combining, PI chart, essential PIs"], "New in syllabus — expect 1 conceptual/short question.", "Petrick's method."),
      ]},
      { n: "Combinational circuits", f: "M", subs: [
        S("MUX, decoder, encoder", 3, "H", ["Implement function using MUX", "Decoder based function", "Cascading MUX/decoders"], "What function does circuit implement.", ""),
        S("Adders & comparators", 2, "M", ["Half/full adder, ripple carry delay", "Carry look-ahead (basic)", "Magnitude comparator"], "Delay computation.", "Gate-level CLA design."),
        S("Hazards / gate delays", 1, "L", ["Propagation delay of circuit paths"], "Critical path delay.", "Glitch analysis in depth."),
      ]},
      { n: "Sequential circuits", f: "H", subs: [
        S("Latches & flip-flops", 2, "M", ["SR, JK, D, T characteristic & excitation tables", "Race-around, master-slave", "FF conversion"], "Output sequence of FF circuit.", ""),
        S("Counters & registers", 3, "H", ["Synchronous/asynchronous counters, mod-N", "Ring & Johnson counter", "Shift registers", "State sequence from given circuit"], "Find counting sequence / modulus — frequent.", ""),
        S("FSM", 2, "M", ["Mealy vs Moore", "State minimization basics"], "Min states for given behaviour.", ""),
      ]},
      { n: "Number representation & computer arithmetic", f: "H", subs: [
        S("Number systems & complements", 3, "H", ["Base conversion", "1's & 2's complement, signed magnitude", "Range, overflow detection", "Booth's multiplication (basic)"], "Range / overflow / result bits.", ""),
        S("Fixed & floating point (IEEE 754)", 3, "H", ["Single/double precision format", "Bias, normalized/denormalized, special values", "Convert decimal ↔ IEEE"], "Hex ↔ float value NAT.", ""),
      ]},
    ],
  },

  // ============================ COA ============================
  {
    id: "coa", name: "Computer Organization & Architecture", status: "new", weight: "7-10", pyqTarget: 200,
    official: "Machine instructions and addressing modes. ALU, data-path, design of control unit — hardwired and microprogrammed. Memory interfacing and hierarchy: performance, cache memory mapping. I/O interface (interrupt and DMA). Instruction pipelining, pipeline hazards. [2027: secondary storage no longer named]",
    topics: [
      { n: "Machine instructions & addressing modes", f: "H", subs: [
        S("Instruction formats", 2, "M", ["0/1/2/3-address instructions", "Opcode/operand field sizes", "Expanding opcode technique"], "Max number of instructions of a type.", ""),
        S("Addressing modes", 2, "H", ["Immediate, direct, indirect, register, register-indirect, indexed, base, relative, auto-inc/dec", "Effective address calculation", "Which mode for arrays/pointers/relocation"], "Identify mode / compute EA / memory references.", ""),
        S("Program execution & CPU performance", 2, "M", ["Instruction cycle, memory references per instruction", "CPI, MIPS, execution time", "Stack/subroutine call effects on SP/PC"], "Execution time / CPI NAT.", ""),
      ]},
      { n: "ALU, data-path & control unit", f: "M", subs: [
        S("Data-path", 2, "M", ["Single vs multi bus organisation", "Micro-operations / register transfers", "Clock cycles for an instruction"], "Number of cycles for given sequence.", ""),
        S("Hardwired control — explicit 2027", 2, "M", ["Control signals generation", "Comparison with microprogrammed"], "Conceptual comparison.", "Gate-level control design."),
        S("Microprogrammed control — explicit 2027", 3, "M", ["Horizontal vs vertical microprogramming", "Control word & control memory size calculation", "Next-address field, branching"], "Control memory size NAT.", ""),
      ]},
      { n: "Memory interfacing & hierarchy", f: "H", subs: [
        S("Memory interfacing — explicit 2027", 2, "M", ["Chip organisation (m × n), number of chips needed", "Address decoding, address lines", "Memory interleaving"], "Chips needed / address range.", ""),
        S("Hierarchy performance", 3, "H", ["Locality", "Avg access time: hierarchical vs simultaneous", "Multi-level cache AMAT, local vs global miss rate"], "AMAT NAT — very frequent.", ""),
        S("Cache mapping", 3, "H", ["Direct, fully associative, k-way set associative", "Tag/index/offset bits", "Tag directory size", "Block replacement (LRU/FIFO) in set-assoc"], "Bit breakup & tag memory size — almost every year.", ""),
        S("Cache performance & write policies", 3, "H", ["Hit/miss counting for array loops (row vs column major)", "Write-through vs write-back, write-allocate", "Types of misses (compulsory/capacity/conflict)"], "Count misses for loop code.", "Cache coherence protocols."),
        S("Secondary storage (disk) — dropped from 2027 text", 1, "L", ["Seek + rotational latency + transfer time basics only"], "Low priority now.", "Deep disk geometry numericals."),
      ]},
      { n: "I/O interface", f: "M", subs: [
        S("Interrupts", 2, "M", ["Vectored/non-vectored, priority, daisy chaining", "Interrupt handling steps"], "Conceptual.", ""),
        S("DMA", 2, "M", ["Burst vs cycle stealing vs transparent", "% CPU time consumed by DMA / programmed I/O"], "DMA time/percentage NAT.", ""),
      ]},
      { n: "Instruction pipelining", f: "H", subs: [
        S("Pipeline performance", 3, "H", ["k-stage speedup, efficiency, throughput", "Non-uniform stage delays + latch delay", "Time for n instructions"], "Speedup / time NAT — every year.", ""),
        S("Pipeline hazards", 3, "H", ["Structural, data (RAW/WAR/WAW), control", "Operand forwarding, stalls count", "Branch penalty, delayed branch, prediction effect on CPI"], "Count stall cycles for given code.", "Superscalar/Tomasulo."),
      ]},
    ],
  },

  // ============================ PROGRAMMING & DS ============================
  {
    id: "c", name: "Programming in C", status: "revise", weight: "4-6", pyqTarget: 120,
    official: "Programming in C. Recursion.",
    topics: [
      { n: "C basics", f: "H", subs: [
        S("Operators, expressions, types", 2, "M", ["Precedence & associativity", "Integer division, implicit conversion, overflow", "Pre/post increment, short-circuit evaluation"], "Output of expression.", "Undefined-behaviour trivia."),
        S("Control flow & functions", 2, "M", ["Loops, switch fall-through", "Function call mechanics"], "Output tracing.", ""),
        S("Storage classes & scope", 3, "H", ["static local variables across calls", "extern/global, block scope shadowing", "Static vs dynamic scoping output"], "Output with static variables — frequent.", ""),
      ]},
      { n: "Pointers, arrays, strings", f: "H", subs: [
        S("Pointers", 3, "H", ["Pointer arithmetic, dereferencing", "Pointer to pointer, pointer to function", "Call by value vs call by reference (swap)"], "Output of pointer code — most frequent C area.", ""),
        S("Arrays & strings", 3, "H", ["a[i] ≡ *(a+i), 2D arrays and a+1, *a+1", "String functions, char arrays vs pointers", "sizeof behaviour"], "Output tracing.", ""),
        S("Structures, unions, dynamic memory", 2, "M", ["struct size basics, pointers to struct", "malloc/free, dangling pointer, memory leak"], "Identify bug / output.", "Padding rules deep dive."),
      ]},
      { n: "Recursion", f: "H", subs: [
        S("Recursion tracing", 3, "H", ["Tracing recursive functions (return value / print order)", "Number of calls, recursion tree", "Tail recursion"], "Value returned / printed — frequent.", ""),
      ]},
    ],
  },
  {
    id: "ds", name: "Data Structures", status: "revise", weight: "6-8", pyqTarget: 150,
    official: "Arrays, stacks, queues, linked lists, trees, binary search trees, binary heaps, graphs.",
    topics: [
      { n: "Arrays", f: "M", subs: [
        S("Array address calculation", 2, "M", ["Row/column major, lower bounds ≠ 0", "Lower/upper triangular storage"], "Address NAT.", ""),
      ]},
      { n: "Stacks & queues", f: "H", subs: [
        S("Stack applications", 3, "H", ["Infix ↔ postfix/prefix, evaluation", "Valid pop sequences", "Recursion ↔ stack"], "Postfix eval / stack contents.", ""),
        S("Queues", 2, "M", ["Circular queue full/empty conditions", "Queue using 2 stacks, stack using queues (op counts)", "Deque, priority queue"], "Cost of operations.", ""),
      ]},
      { n: "Linked lists", f: "M", subs: [
        S("Linked list operations", 2, "M", ["Insert/delete/reverse code", "Doubly & circular list pointer updates", "Complexity of operations"], "What does this code do.", ""),
      ]},
      { n: "Trees & BST", f: "H", subs: [
        S("Binary tree properties", 3, "H", ["Nodes vs height bounds, leaves = internal+1 (full)", "Traversals & reconstruct from (in+pre)/(in+post)", "Count of tree shapes (Catalan)"], "Counting / traversal — very frequent.", ""),
        S("BST", 3, "H", ["Insert, delete (inorder successor)", "Valid BST sequences, number of BSTs", "Height worst/best case"], "Resulting tree / search path validity.", ""),
        S("AVL", 2, "M", ["Rotations (LL, RR, LR, RL)", "Min nodes for height h (Fibonacci-like)"], "Tree after insertions; min nodes NAT.", "Red-black trees."),
      ]},
      { n: "Binary heaps", f: "H", subs: [
        S("Heap operations", 3, "H", ["Build heap O(n), insert, delete-min/max", "Array representation, parent/child index", "k-th smallest location, heap after operations"], "Array after operations — frequent.", "Fibonacci/binomial heaps."),
      ]},
      { n: "Hashing", f: "M", subs: [
        S("Hashing techniques", 2, "M", ["Chaining, linear/quadratic probing, double hashing", "Load factor, expected probes", "Final table after insertions"], "Hash table contents NAT.", ""),
      ]},
      { n: "Graphs (representation)", f: "L", subs: [
        S("Representation", 1, "L", ["Adjacency matrix vs list — space/time trade-off"], "Conceptual.", ""),
      ]},
    ],
  },

  // ============================ ALGORITHMS ============================
  {
    id: "algo", name: "Algorithms", status: "revise", weight: "6-9", pyqTarget: 200,
    official: "Searching, sorting, hashing. Asymptotic worst case time and space complexity. Algorithm design techniques: greedy, dynamic programming and divide-and-conquer. Graph traversals, minimum spanning trees, shortest paths.",
    topics: [
      { n: "Asymptotic analysis", f: "H", subs: [
        S("Notations & comparing functions", 3, "H", ["O, Ω, Θ, o, ω", "Ordering functions (log, poly, exp, n!, n^logn)", "Use logs to compare"], "Arrange functions — frequent.", ""),
        S("Recurrences", 3, "H", ["Master theorem (all 3 cases + extended)", "Recursion tree, substitution", "T(n)=T(√n)+… via change of variable"], "Solve recurrence.", "Akra-Bazzi."),
        S("Code complexity", 3, "H", ["Nested loops with i*=2, j+=i", "Harmonic series, log log n loops"], "Time complexity of snippet.", ""),
      ]},
      { n: "Searching & sorting", f: "H", subs: [
        S("Sorting algorithms", 3, "H", ["Bubble, insertion, selection, merge, quick, heap, counting/radix", "Best/avg/worst, stable?, in-place?", "Number of comparisons/swaps", "Quick sort pivot cases, partition output"], "Which sort / comparisons / pass output.", ""),
        S("Searching", 2, "M", ["Binary search variations", "Lower bound Ω(n log n) for comparison sort", "Selection (median of medians concept)"], "Complexity questions.", ""),
      ]},
      { n: "Divide & conquer", f: "M", subs: [
        S("D&C algorithms", 2, "M", ["Merge sort, quick sort, binary search", "Min-max comparisons (3n/2 − 2)", "Strassen, integer multiplication (recurrence only)"], "Recurrence / comparisons.", "Strassen derivation."),
      ]},
      { n: "Greedy", f: "M", subs: [
        S("Greedy algorithms", 2, "M", ["Huffman coding (avg code length)", "Fractional knapsack, job sequencing with deadlines", "Activity selection"], "Huffman NAT / max profit.", ""),
        S("Minimum spanning trees", 3, "H", ["Prim & Kruskal (edge order)", "Cut & cycle property, uniqueness", "MST weight, effect of changing weights"], "MST weight/edge order — very frequent.", ""),
      ]},
      { n: "Dynamic programming", f: "H", subs: [
        S("Standard DP problems", 3, "H", ["LCS, 0/1 knapsack, matrix chain multiplication", "Subset sum, edit distance, coin change", "Filling DP table / recurrence identification"], "Table value / recurrence — frequent.", "Advanced DP (bitmask, DP on trees)."),
      ]},
      { n: "Graph algorithms", f: "H", subs: [
        S("BFS & DFS", 3, "H", ["Traversal orders, DFS tree edge types", "Topological sort, SCC (Kosaraju idea)", "Articulation points basic", "Complexity with list vs matrix"], "Valid DFS/BFS order; edge classification.", ""),
        S("Shortest paths", 3, "H", ["Dijkstra (fails with negative), trace", "Bellman-Ford, negative cycles", "Floyd-Warshall", "Complexities with heap"], "Distances/order — frequent.", "Johnson's algorithm."),
      ]},
      { n: "Hashing (algorithmic)", f: "L", subs: [
        S("Hashing analysis", 1, "L", ["Expected collisions, uniform hashing assumptions"], "Expected value questions.", ""),
      ]},
    ],
  },

  // ============================ TOC ============================
  {
    id: "toc", name: "Theory of Computation", status: "revise", weight: "7-9", pyqTarget: 170,
    official: "Regular expressions and finite automata. Context-free grammars and push-down automata. Regular and context-free languages, pumping lemma. Turing machines and undecidability.",
    topics: [
      { n: "Finite automata", f: "H", subs: [
        S("DFA/NFA design", 3, "H", ["Min DFA states for given language (mod, substring, prefix/suffix)", "NFA → DFA subset construction", "DFA minimization"], "Min states NAT — every year.", "ε-NFA formal proofs."),
        S("Regular expressions", 3, "H", ["RE ↔ FA", "RE equivalence, language of RE", "Arden's theorem"], "Which RE describes language.", ""),
      ]},
      { n: "Regular languages", f: "H", subs: [
        S("Closure & decision properties", 3, "H", ["Closure under ∪, ∩, complement, reversal, homomorphism, quotient", "Finite/infinite, emptiness decidable"], "True/false statements (MSQ).", ""),
        S("Identifying regular languages", 3, "H", ["Needs unbounded counting → non-regular", "Pumping lemma (use to disprove)", "Myhill-Nerode (concept)"], "Which language is regular — very frequent.", "Writing formal pumping proofs."),
      ]},
      { n: "CFG & PDA", f: "H", subs: [
        S("Context-free grammars", 2, "M", ["Language of grammar", "Ambiguity", "CNF (steps/derivation length 2n−1)"], "Language generated / ambiguous?", "GNF conversion by hand."),
        S("Push-down automata", 2, "M", ["NPDA vs DPDA", "DCFL vs CFL examples"], "Which is DCFL.", ""),
        S("CFL properties", 3, "H", ["Closure: ∪, concat, * yes; ∩, complement no; ∩ regular yes", "Identify CFL vs non-CFL (a^n b^n c^n)", "Decision problems for CFL"], "Classify languages — very frequent.", ""),
      ]},
      { n: "Turing machines & undecidability", f: "H", subs: [
        S("TM & language classes", 2, "M", ["Recursive vs RE vs non-RE", "Closure of REC and RE", "Complement relations (L & L' both RE ⇒ REC)"], "MSQ on classes.", "TM construction by hand."),
        S("Decidability", 3, "H", ["Halting problem, reductions", "Rice's theorem (non-trivial semantic property)", "Decidable/undecidable table for Reg/CFL/REC/RE problems"], "Decidable or not — every year.", "Formal reduction proofs."),
      ]},
    ],
  },

  // ============================ COMPILER DESIGN ============================
  {
    id: "cd", name: "Compiler Design", status: "revise", weight: "4-6", pyqTarget: 120,
    official: "Lexical analysis, parsing, syntax directed translation. Runtime environments. Intermediate code generation. Local optimisation, Data flow analyses: constant propagation, liveness analysis, common subexpression elimination.",
    topics: [
      { n: "Lexical analysis", f: "M", subs: [
        S("Tokens & lexer", 1, "M", ["Count tokens in code", "Lexer errors vs parser errors", "Longest match rule"], "Token count NAT.", "Lex tool syntax."),
      ]},
      { n: "Parsing", f: "H", subs: [
        S("FIRST & FOLLOW", 3, "H", ["Compute FIRST/FOLLOW incl. ε", "Left recursion removal, left factoring"], "FIRST/FOLLOW sets.", ""),
        S("Top-down: LL(1)", 3, "H", ["LL(1) table entries & conflicts", "Is grammar LL(1)?"], "Table entry / LL(1) check.", ""),
        S("Bottom-up: LR family", 3, "H", ["LR(0) items, SLR(1), CLR(1), LALR(1)", "SR/RR conflicts, number of states", "Power relation LR(0) ⊂ SLR ⊂ LALR ⊂ CLR"], "Conflicts / states count — frequent.", "Operator precedence parsing details."),
      ]},
      { n: "Syntax directed translation", f: "M", subs: [
        S("SDT", 2, "M", ["S-attributed vs L-attributed", "Evaluate SDT on input (print output/value)"], "Output of SDT.", ""),
      ]},
      { n: "Runtime environments", f: "L", subs: [
        S("Activation records", 1, "L", ["Stack vs heap vs static allocation", "Activation record fields, recursion needs stack"], "Conceptual.", "Display/access link implementation."),
      ]},
      { n: "Intermediate code generation", f: "M", subs: [
        S("IR forms", 2, "M", ["3-address code, quadruples/triples", "SSA form (count variables)", "DAG for expression (min nodes)", "Basic blocks & CFG (count blocks)"], "Min temporaries / DAG nodes / blocks.", ""),
      ]},
      { n: "Optimisation & data flow", f: "M", subs: [
        S("Local optimisation", 2, "M", ["Constant folding, CSE, dead code, copy propagation", "Strength reduction, loop-invariant (concept)"], "Which optimisation applies.", "Global loop optimisation algorithms."),
        S("Data flow analysis", 2, "M", ["Liveness (backward), live variables at points", "Constant propagation, available expressions", "Register count via liveness"], "Live variables / min registers.", ""),
      ]},
    ],
  },

  // ============================ OS ============================
  {
    id: "os", name: "Operating Systems", status: "new", weight: "7-10", pyqTarget: 200,
    official: "System calls, processes, threads, inter-process communication, concurrency and synchronization. Deadlock. CPU and I/O scheduling. Memory management and virtual memory. File systems.",
    topics: [
      { n: "Processes, threads & system calls", f: "H", subs: [
        S("Process basics", 2, "M", ["Process states & transitions, PCB", "User vs kernel mode, system calls", "Context switch"], "Which transition possible.", ""),
        S("fork()", 3, "H", ["Number of processes/prints for fork in loops/conditions", "Parent/child return values"], "Count processes — frequent.", "exec/wait internals."),
        S("Threads", 2, "M", ["User vs kernel threads, what's shared", "Multithreading models"], "Conceptual MSQ.", ""),
        S("IPC", 1, "L", ["Shared memory vs message passing"], "Conceptual.", ""),
      ]},
      { n: "CPU scheduling", f: "H", subs: [
        S("Scheduling algorithms", 3, "H", ["FCFS, SJF, SRTF, priority (pre/non-pre), RR, HRRN", "Gantt chart; avg WT, TAT, RT; context switches", "Starvation & convoy effect; MLQ/MLFQ concepts"], "Avg waiting time NAT — every year.", ""),
      ]},
      { n: "Concurrency & synchronization", f: "H", subs: [
        S("Critical section", 3, "H", ["Mutual exclusion, progress, bounded waiting", "Peterson's, Dekker's, TSL/swap", "Checking a given solution"], "Does code satisfy ME/progress?", ""),
        S("Semaphores & monitors", 3, "H", ["Counting/binary semaphores, final value", "Producer-consumer, readers-writers, dining philosophers", "Deadlock in semaphore code"], "Semaphore code output — very frequent.", ""),
      ]},
      { n: "Deadlock", f: "H", subs: [
        S("Deadlock theory", 2, "M", ["4 conditions, RAG", "Prevention, avoidance, detection, recovery"], "MSQ statements.", ""),
        S("Banker's & resource numericals", 3, "H", ["Safe sequence", "Min resources to avoid deadlock: Σ(need−1)+1"], "Numericals — frequent.", ""),
      ]},
      { n: "Memory management", f: "H", subs: [
        S("Contiguous allocation", 1, "L", ["First/best/worst fit", "Internal vs external fragmentation"], "Which fit allocates.", ""),
        S("Paging", 3, "H", ["Page table size, logical/physical address bits", "Multi-level paging, page table entries per page", "TLB & EAT", "Inverted page table"], "Bit/size NAT — every year.", ""),
        S("Segmentation", 1, "L", ["Segment table, address translation"], "Physical address calc.", ""),
      ]},
      { n: "Virtual memory", f: "H", subs: [
        S("Demand paging", 3, "H", ["Page fault service, EAT with faults", "Thrashing, working set"], "EAT NAT.", ""),
        S("Page replacement", 3, "H", ["FIFO, Optimal, LRU, LFU/MFU, clock", "Page fault counting", "Belady's anomaly, stack algorithms"], "Fault count — every year.", ""),
      ]},
      { n: "File systems", f: "M", subs: [
        S("File allocation & inode", 2, "M", ["Contiguous, linked, indexed", "Inode max file size with direct/indirect pointers", "Disk blocks needed"], "Max file size NAT.", "Journaling internals."),
        S("Directory & free space", 1, "L", ["Directory structures", "Bitmap vs linked free list"], "Conceptual.", ""),
      ]},
      { n: "I/O scheduling", f: "M", subs: [
        S("Disk scheduling", 2, "M", ["FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK", "Total head movement"], "Head movement NAT.", ""),
      ]},
    ],
  },

  // ============================ DBMS ============================
  {
    id: "dbms", name: "Databases (DBMS)", status: "revise", weight: "6-8", pyqTarget: 170,
    official: "ER-model. Relational model: relational algebra, tuple calculus, SQL. Integrity constraints, normal forms. File organization, indexing (e.g., B and B+ trees). Transactions and concurrency control.",
    topics: [
      { n: "ER model", f: "M", subs: [
        S("ER → relational", 2, "M", ["Entities, weak entities, relationships, cardinality, participation", "Min number of tables", "Multivalued attributes"], "Min tables NAT.", ""),
      ]},
      { n: "Relational model & queries", f: "H", subs: [
        S("Relational algebra", 3, "H", ["σ, π, ×, ⋈, ∪, −, ÷", "Natural join, outer joins", "Result tuple count bounds"], "Output/ tuples count.", ""),
        S("Tuple relational calculus", 2, "M", ["Translate TRC ↔ English / RA", "Safe expressions"], "Equivalent query.", "Domain relational calculus."),
        S("SQL", 3, "H", ["Joins, nested & correlated subqueries, EXISTS/IN/ALL/ANY", "GROUP BY/HAVING, aggregates", "NULL semantics"], "Output of SQL query — every year.", "Triggers, stored procedures."),
      ]},
      { n: "Integrity constraints & normalisation", f: "H", subs: [
        S("Functional dependencies & keys", 3, "H", ["Attribute closure, candidate keys (count)", "Minimal cover", "Armstrong's axioms"], "Candidate key count — frequent.", ""),
        S("Normal forms & decomposition", 3, "H", ["1NF, 2NF, 3NF, BCNF identification", "Lossless join test, dependency preservation", "Referential integrity, ON DELETE CASCADE"], "Highest NF / lossless? — frequent.", "4NF/5NF depth."),
      ]},
      { n: "File organisation & indexing", f: "H", subs: [
        S("Indexing", 2, "M", ["Primary, clustering, secondary index", "Dense vs sparse; blocks accessed"], "Block access NAT.", ""),
        S("B & B+ trees", 3, "H", ["Order calculation from block size", "Min/max keys at levels, height", "Insertion splits"], "Order / nodes NAT — frequent.", "Deletion in B-trees in depth."),
      ]},
      { n: "Transactions & concurrency control", f: "H", subs: [
        S("Schedules", 3, "H", ["Conflict & view serializability (precedence graph)", "Recoverable, cascadeless, strict", "Count serializable schedules"], "Is schedule CS/recoverable — every year.", ""),
        S("Concurrency protocols", 2, "M", ["2PL, strict/rigorous 2PL", "Timestamp ordering, Thomas write rule", "Deadlock possibility in protocols"], "Protocol guarantees (MSQ).", "Multi-version CC, recovery algorithms (ARIES)."),
      ]},
    ],
  },

  // ============================ CN ============================
  {
    id: "cn", name: "Computer Networks", status: "revise", weight: "6-9", pyqTarget: 170,
    official: "Principles of layering. Basics of switching (circuit, packet, virtual circuit) and performance metrics. Data link layer: error detection, MAC, Ethernet. Distance vector and link state routing. IPv4 (fragmentation, CIDR, NAT). TCP (flow and congestion control, socket API). DNS and HTTP. [2027: ARP, DHCP, ICMP, UDP, SMTP, FTP, email no longer named]",
    topics: [
      { n: "Layering & switching", f: "M", subs: [
        S("Principles of layering", 1, "M", ["Why layering, encapsulation, headers", "OSI vs TCP/IP roles"], "Conceptual (wording changed in 2027).", "Which-layer trivia for every protocol."),
        S("Switching & performance metrics", 3, "H", ["Transmission, propagation, queuing delay", "Circuit vs packet vs virtual circuit", "Store-and-forward with multiple hops, bandwidth-delay product, throughput"], "Delay NAT — frequent.", ""),
      ]},
      { n: "Data link layer", f: "H", subs: [
        S("Error detection", 3, "H", ["CRC (remainder, detection capability)", "Checksum, parity, Hamming distance (detect d−1, correct ⌊(d−1)/2⌋)"], "CRC remainder / Hamming.", "Reed-Solomon."),
        S("Flow control (sliding window)", 3, "H", ["Stop-and-wait efficiency", "GBN & SR window sizes, sequence number bits", "Utilization = W/(1+2a)"], "Window/efficiency NAT — frequent.", ""),
        S("MAC & Ethernet", 2, "M", ["ALOHA / slotted ALOHA throughput", "CSMA/CD min frame size = 2 × Tp × B", "Ethernet frame, backoff; bridges/switches learning"], "Min frame size NAT.", "Token ring details."),
      ]},
      { n: "Network layer", f: "H", subs: [
        S("IPv4 addressing & CIDR", 3, "H", ["Subnetting, hosts per subnet", "CIDR, route aggregation, longest prefix match", "Special addresses"], "Forwarding table / subnet NAT — every year.", ""),
        S("Fragmentation & NAT", 3, "H", ["IPv4 header fields (TTL, ID, flags, offset)", "Fragment offsets & sizes", "NAT working"], "Fragment offset NAT.", ""),
        S("Routing", 3, "H", ["Distance vector (Bellman-Ford), count-to-infinity, split horizon", "Link state (Dijkstra), flooding"], "Routing table after updates.", "BGP/OSPF details."),
        S("ARP, DHCP, ICMP — dropped from 2027 text", 1, "L", ["One-line purpose of each only"], "Low priority now.", "Packet formats."),
      ]},
      { n: "Transport layer", f: "H", subs: [
        S("TCP basics", 2, "M", ["Header fields, 3-way handshake, sequence/ack numbers", "Connection termination", "Wrap-around time, UDP one-liner (not named in 2027)"], "Seq number NAT.", ""),
        S("TCP flow & congestion control", 3, "H", ["Receiver window, slow start, congestion avoidance (AIMD)", "Timeout vs 3 dup ACKs (Tahoe/Reno)", "cwnd after n RTTs"], "cwnd NAT — frequent.", ""),
        S("Socket API", 2, "M", ["socket, bind, listen, accept, connect, send/recv, close — order & role"], "Order of calls (explicit in 2027).", "Socket programming code."),
      ]},
      { n: "Application layer", f: "M", subs: [
        S("DNS & HTTP", 2, "M", ["DNS: iterative vs recursive, caching", "HTTP persistent vs non-persistent, RTT count, pipelining"], "RTT counting NAT.", "SMTP/FTP/email (not named in 2027)."),
      ]},
    ],
  },
];

const DEPTH_LABEL = { 1: "BASIC", 2: "STANDARD", 3: "DEEP" };
const DEPTH_HELP = {
  1: "Definitions + direct formula. 1-mark conceptual level tak. Zyada time mat do.",
  2: "Saare standard PYQ types solve ho jaane chahiye, numericals with speed.",
  3: "High-frequency 2-mark area. Har variation, edge case, trick master karo — yahi rank banata hai.",
};
const FREQ_LABEL = { H: "High", M: "Medium", L: "Low" };
const goSearch = (q) => "https://gateoverflow.in/search?q=" + encodeURIComponent(q);
