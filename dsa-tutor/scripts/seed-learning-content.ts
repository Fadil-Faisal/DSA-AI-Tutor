import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const videoLessons = [
  {
    id: 'video-arrays-intro',
    topic: 'arrays',
    difficulty: 'intro',
    title: 'Arrays Explained — How They Work in Memory',
    video_url: 'https://www.youtube.com/embed/QJNwK2uJyGs',
    duration_seconds: 480,
    key_concepts: ['indexing', 'iteration', 'memory layout', 'bounds checking'],
    thumbnail_url: 'https://img.youtube.com/vi/QJNwK2uJyGs/hqdefault.jpg',
    transcript: 'An array stores elements in contiguous memory locations. Each element can be accessed directly using its index in O(1) time. Arrays have a fixed size and support fast reads but slow insertions and deletions at arbitrary positions.'
  },
  {
    id: 'video-trees-intro',
    topic: 'trees',
    difficulty: 'intro',
    title: 'Binary Trees — Structure, Traversal & Recursion',
    video_url: 'https://www.youtube.com/embed/oSWTXtMglKE',
    duration_seconds: 600,
    key_concepts: ['nodes', 'root', 'leaf', 'parent', 'child', 'depth', 'DFS', 'BFS'],
    thumbnail_url: 'https://img.youtube.com/vi/oSWTXtMglKE/hqdefault.jpg',
    transcript: 'A binary tree is a hierarchical data structure where each node has at most two children. The topmost node is called the root. We can traverse trees using depth-first search (DFS) or breadth-first search (BFS).'
  },
  {
    id: 'video-graphs-intro',
    topic: 'graphs',
    difficulty: 'intro',
    title: 'Graph Theory for Beginners — Nodes, Edges & Traversal',
    video_url: 'https://www.youtube.com/embed/tWVWeAqZ0WU',
    duration_seconds: 720,
    key_concepts: ['vertices', 'edges', 'directed', 'undirected', 'BFS', 'DFS', 'adjacency list'],
    thumbnail_url: 'https://img.youtube.com/vi/tWVWeAqZ0WU/hqdefault.jpg',
    transcript: 'A graph consists of vertices (nodes) connected by edges. Graphs can be directed or undirected. We represent graphs using adjacency lists or matrices and traverse them using BFS or DFS.'
  },
  {
    id: 'video-dp-intro',
    topic: 'dp',
    difficulty: 'intro',
    title: 'Dynamic Programming — Breaking Down the Core Idea',
    video_url: 'https://www.youtube.com/embed/oBt53YbR9Kk',
    duration_seconds: 900,
    key_concepts: ['overlapping subproblems', 'memoization', 'tabulation', 'optimal substructure'],
    thumbnail_url: 'https://img.youtube.com/vi/oBt53YbR9Kk/hqdefault.jpg',
    transcript: 'Dynamic programming solves complex problems by breaking them into overlapping subproblems and storing results to avoid redundant computation. Two approaches: top-down memoization and bottom-up tabulation.'
  },
  {
    id: 'video-recursion-intro',
    topic: 'recursion',
    difficulty: 'intro',
    title: 'Recursion Explained — Base Cases, Call Stack & Patterns',
    video_url: 'https://www.youtube.com/embed/ngCos392W4w',
    duration_seconds: 540,
    key_concepts: ['base case', 'recursive case', 'call stack', 'stack overflow', 'backtracking'],
    thumbnail_url: 'https://img.youtube.com/vi/ngCos392W4w/hqdefault.jpg',
    transcript: 'Recursion is when a function calls itself. Every recursive function needs a base case (stopping condition) and a recursive case. The call stack tracks all active function calls.'
  },
  {
    id: 'video-sorting-intro',
    topic: 'sorting',
    difficulty: 'intro',
    title: 'Sorting Algorithms Visualized — Bubble, Merge & Quick Sort',
    video_url: 'https://www.youtube.com/embed/kPRA0W1kECg',
    duration_seconds: 660,
    key_concepts: ['bubble sort', 'merge sort', 'quick sort', 'time complexity', 'stability'],
    thumbnail_url: 'https://img.youtube.com/vi/kPRA0W1kECg/hqdefault.jpg',
    transcript: 'Sorting arranges elements in order. Bubble sort is O(n²) — simple but slow. Merge sort is O(n log n) and stable. Quick sort is O(n log n) average but O(n²) worst case.'
  },
  {
    id: 'video-searching-intro',
    topic: 'searching',
    difficulty: 'intro',
    title: 'Binary Search — Why It Is So Fast and How It Works',
    video_url: 'https://www.youtube.com/embed/P3YID7liBug',
    duration_seconds: 420,
    key_concepts: ['linear search', 'binary search', 'sorted array', 'divide and conquer', 'mid pointer'],
    thumbnail_url: 'https://img.youtube.com/vi/P3YID7liBug/hqdefault.jpg',
    transcript: 'Binary search works on sorted arrays by repeatedly halving the search space. At each step, compare the target with the middle element and eliminate half the array. Time complexity: O(log n).'
  },
  {
    id: 'video-strings-intro',
    topic: 'strings',
    difficulty: 'intro',
    title: 'String Manipulation — Techniques Every Developer Should Know',
    video_url: 'https://www.youtube.com/embed/Mj4BfnlCMrc',
    duration_seconds: 480,
    key_concepts: ['immutability', 'slicing', 'two pointers', 'sliding window', 'palindrome'],
    thumbnail_url: 'https://img.youtube.com/vi/Mj4BfnlCMrc/hqdefault.jpg',
    transcript: 'Strings are sequences of characters. Common patterns include two pointers for palindrome checking, sliding window for substring problems, and hash maps for frequency counting.'
  },
  {
    id: 'video-heaps-intro',
    topic: 'heaps',
    difficulty: 'intro',
    title: 'Heaps & Priority Queues — Min Heap, Max Heap Explained',
    video_url: 'https://www.youtube.com/embed/t0Cq6tVNRBA',
    duration_seconds: 540,
    key_concepts: ['min heap', 'max heap', 'heapify', 'priority queue', 'k-th largest'],
    thumbnail_url: 'https://img.youtube.com/vi/t0Cq6tVNRBA/hqdefault.jpg',
    transcript: 'A heap is a complete binary tree where each parent is smaller (min-heap) or larger (max-heap) than its children. Heaps power priority queues and support O(log n) insert and O(1) peek.'
  },
  {
    id: 'video-linked-lists-intro',
    topic: 'linked_lists',
    difficulty: 'intro',
    title: 'Linked Lists — Nodes, Pointers & Classic Problems',
    video_url: 'https://www.youtube.com/embed/WwfhLC16bis',
    duration_seconds: 600,
    key_concepts: ['node', 'pointer', 'head', 'tail', 'singly linked', 'doubly linked', 'cycle detection'],
    thumbnail_url: 'https://img.youtube.com/vi/WwfhLC16bis/hqdefault.jpg',
    transcript: 'A linked list consists of nodes where each node contains data and a pointer to the next node. Unlike arrays, linked lists allow O(1) insertion at the head but O(n) access by index.'
  }
];

const conceptQuestions = [
  // Arrays (3 questions)
  {
    id: 'cq-arrays-001',
    video_id: 'video-arrays-intro',
    topic: 'arrays',
    question_text: 'What is the time complexity of accessing an element in an array by its index?',
    question_type: 'multiple_choice',
    options: { A: 'O(n)', B: 'O(1)', C: 'O(log n)', D: 'O(n²)' },
    correct_answer: 'B',
    explanation: 'Arrays provide O(1) constant time access because elements are stored in contiguous memory locations and can be accessed directly via their index.',
    difficulty: 'easy',
    order_index: 1
  },
  {
    id: 'cq-arrays-002',
    video_id: 'video-arrays-intro',
    topic: 'arrays',
    question_text: 'Why is it important to check array bounds when accessing elements?',
    question_type: 'multiple_choice',
    options: { A: 'It makes the code run faster', B: 'It prevents accessing memory outside the array (index out of bounds)', C: 'It automatically sorts the array', D: 'It is not important' },
    correct_answer: 'B',
    explanation: 'Checking bounds prevents accessing memory outside the allocated array, which can cause crashes or security vulnerabilities.',
    difficulty: 'easy',
    order_index: 2
  },
  {
    id: 'cq-arrays-003',
    video_id: 'video-arrays-intro',
    topic: 'arrays',
    question_text: 'What happens when you try to insert an element at the beginning of a full array?',
    question_type: 'multiple_choice',
    options: { A: 'Takes O(1) time', B: 'Takes O(n) time because all elements must shift', C: 'Takes O(log n) time', D: 'Impossible to answer' },
    correct_answer: 'B',
    explanation: 'Inserting at the beginning requires shifting all existing elements by one position, which takes O(n) time.',
    difficulty: 'easy',
    order_index: 3
  },

  // Trees (3 questions)
  {
    id: 'cq-trees-001',
    video_id: 'video-trees-intro',
    topic: 'trees',
    question_text: 'In a binary tree, what is the maximum number of children a node can have?',
    question_type: 'multiple_choice',
    options: { A: '1', B: '2', C: '3', D: 'Unlimited' },
    correct_answer: 'B',
    explanation: 'By definition, a binary tree node can have at most 2 children (left and right).',
    difficulty: 'easy',
    order_index: 1
  },
  {
    id: 'cq-trees-002',
    video_id: 'video-trees-intro',
    topic: 'trees',
    question_text: 'Which traversal uses a queue data structure?',
    question_type: 'multiple_choice',
    options: { A: 'DFS', B: 'Inorder', C: 'BFS (Breadth-First Search)', D: 'Preorder' },
    correct_answer: 'C',
    explanation: 'BFS uses a queue to process nodes level by level, ensuring nodes at depth d are processed before depth d+1.',
    difficulty: 'easy',
    order_index: 2
  },
  {
    id: 'cq-trees-003',
    video_id: 'video-trees-intro',
    topic: 'trees',
    question_text: 'What is the root node in a tree?',
    question_type: 'multiple_choice',
    options: { A: 'The bottommost node', B: 'The topmost node with no parent', C: 'The node with most children', D: 'Any node at the bottom' },
    correct_answer: 'B',
    explanation: 'The root is the topmost node in a tree and has no parent. It is the starting point for tree traversals.',
    difficulty: 'easy',
    order_index: 3
  },

  // Graphs (3 questions)
  {
    id: 'cq-graphs-001',
    video_id: 'video-graphs-intro',
    topic: 'graphs',
    question_text: 'In a directed graph, what do arrows on edges indicate?',
    question_type: 'multiple_choice',
    options: { A: 'Distance between nodes', B: 'Direction of the relationship (one-way)', C: 'Weight of the edge', D: 'Nothing special' },
    correct_answer: 'B',
    explanation: 'Arrows show the direction — you can only travel from one vertex to another in the direction the arrow points.',
    difficulty: 'easy',
    order_index: 1
  },
  {
    id: 'cq-graphs-002',
    video_id: 'video-graphs-intro',
    topic: 'graphs',
    question_text: 'What is an adjacency list used for?',
    question_type: 'multiple_choice',
    options: { A: 'Sorting vertices', B: 'Storing which vertices are connected by edges', C: 'Finding the shortest path', D: 'Counting edges' },
    correct_answer: 'B',
    explanation: 'An adjacency list stores, for each vertex, a list of vertices it is connected to by an edge.',
    difficulty: 'easy',
    order_index: 2
  },
  {
    id: 'cq-graphs-003',
    video_id: 'video-graphs-intro',
    topic: 'graphs',
    question_text: 'Which algorithm would you use to find the shortest path in an unweighted graph?',
    question_type: 'multiple_choice',
    options: { A: 'Dijkstra', B: 'BFS', C: 'DFS', D: 'Bellman-Ford' },
    correct_answer: 'B',
    explanation: 'BFS finds the shortest path in unweighted graphs because it explores level by level.',
    difficulty: 'easy',
    order_index: 3
  },

  // DP (3 questions)
  {
    id: 'cq-dp-001',
    video_id: 'video-dp-intro',
    topic: 'dp',
    question_text: 'What is memoization in dynamic programming?',
    question_type: 'multiple_choice',
    options: { A: 'Writing code faster', B: 'Storing computed results to avoid redundant calculations', C: 'Sorting algorithms', D: 'Memory management in C' },
    correct_answer: 'B',
    explanation: 'Memoization caches the results of expensive function calls so they can be reused when needed again.',
    difficulty: 'easy',
    order_index: 1
  },
  {
    id: 'cq-dp-002',
    video_id: 'video-dp-intro',
    topic: 'dp',
    question_text: 'What is the key requirement for a problem to be solvable by dynamic programming?',
    question_type: 'multiple_choice',
    options: { A: 'Must have exactly 2 variables', B: 'Must have overlapping subproblems and optimal substructure', C: 'Must use recursion', D: 'Must be sorting-related' },
    correct_answer: 'B',
    explanation: 'DP works when the problem can be broken into smaller subproblems that overlap, and the optimal solution can be built from optimal subproblem solutions.',
    difficulty: 'easy',
    order_index: 2
  },
  {
    id: 'cq-dp-003',
    video_id: 'video-dp-intro',
    topic: 'dp',
    question_text: 'What is tabulation in dynamic programming?',
    question_type: 'multiple_choice',
    options: { A: 'Using a spreadsheet', B: 'Building solutions bottom-up using a table (iteration)', C: 'Writing recursive solutions', D: 'Using recursion with memoization' },
    correct_answer: 'B',
    explanation: 'Tabulation is the bottom-up approach where you fill in a table iteratively, starting from the smallest subproblems.',
    difficulty: 'easy',
    order_index: 3
  },

  // Recursion (3 questions)
  {
    id: 'cq-recursion-001',
    video_id: 'video-recursion-intro',
    topic: 'recursion',
    question_text: 'What is the base case in a recursive function?',
    question_type: 'multiple_choice',
    options: { A: 'The first line of code', B: 'The condition that stops the recursion (no more recursive calls)', C: 'The variable that changes each call', D: 'The most complex case' },
    correct_answer: 'B',
    explanation: 'The base case is the condition that tells the function to stop calling itself, preventing infinite recursion.',
    difficulty: 'easy',
    order_index: 1
  },
  {
    id: 'cq-recursion-002',
    video_id: 'video-recursion-intro',
    topic: 'recursion',
    question_text: 'What happens if a recursive function has no base case?',
    question_type: 'multiple_choice',
    options: { A: 'It runs faster', B: 'It causes infinite recursion and potentially a stack overflow', C: 'It automatically returns 0', D: 'It works perfectly' },
    correct_answer: 'B',
    explanation: 'Without a base case, the function keeps calling itself forever, eventually filling up the call stack and causing a stack overflow.',
    difficulty: 'easy',
    order_index: 2
  },
  {
    id: 'cq-recursion-003',
    video_id: 'video-recursion-intro',
    topic: 'recursion',
    question_text: 'What is the call stack?',
    question_type: 'multiple_choice',
    options: { A: 'A data structure for queues', B: 'A stack that tracks all active function calls in order', C: 'A type of array', D: 'A sorting algorithm' },
    correct_answer: 'B',
    explanation: 'The call stack is a stack data structure that keeps track of all function calls that have been initiated but not yet completed.',
    difficulty: 'easy',
    order_index: 3
  },

  // Sorting (3 questions)
  {
    id: 'cq-sorting-001',
    video_id: 'video-sorting-intro',
    topic: 'sorting',
    question_text: 'What is the time complexity of bubble sort?',
    question_type: 'multiple_choice',
    options: { A: 'O(n)', B: 'O(n²)', C: 'O(log n)', D: 'O(n log n)' },
    correct_answer: 'B',
    explanation: 'Bubble sort compares adjacent elements and swaps them if needed, resulting in O(n²) time complexity.',
    difficulty: 'easy',
    order_index: 1
  },
  {
    id: 'cq-sorting-002',
    video_id: 'video-sorting-intro',
    topic: 'sorting',
    question_text: 'Why is merge sort considered stable?',
    question_type: 'multiple_choice',
    options: { A: 'It never crashes', B: 'Equal elements maintain their relative order from input to output', C: 'It always runs in O(n log n)', D: 'It uses recursion' },
    correct_answer: 'B',
    explanation: 'A stable sort preserves the relative order of equal elements. Merge sort is stable because it processes left half first.',
    difficulty: 'easy',
    order_index: 2
  },
  {
    id: 'cq-sorting-003',
    video_id: 'video-sorting-intro',
    topic: 'sorting',
    question_text: 'What is the worst-case time complexity of quick sort?',
    question_type: 'multiple_choice',
    options: { A: 'O(n)', B: 'O(n log n)', C: 'O(n²)', D: 'O(log n)' },
    correct_answer: 'C',
    explanation: 'Quick sort has O(n²) worst case when the pivot is always the smallest or largest element (e.g., already sorted array).',
    difficulty: 'easy',
    order_index: 3
  },

  // Searching (3 questions)
  {
    id: 'cq-searching-001',
    video_id: 'video-searching-intro',
    topic: 'searching',
    question_text: 'What is required for binary search to work?',
    question_type: 'multiple_choice',
    options: { A: 'Unsorted array', B: 'Sorted array', C: 'Array with no duplicates', D: 'Array with exactly 10 elements' },
    correct_answer: 'B',
    explanation: 'Binary search requires a sorted array because it relies on comparing the target with the middle element and eliminating half.',
    difficulty: 'easy',
    order_index: 1
  },
  {
    id: 'cq-searching-002',
    video_id: 'video-searching-intro',
    topic: 'searching',
    question_text: 'What is the time complexity of binary search?',
    question_type: 'multiple_choice',
    options: { A: 'O(n)', B: 'O(1)', C: 'O(log n)', D: 'O(n²)' },
    correct_answer: 'C',
    explanation: 'Binary search halves the search space each time, resulting in O(log n) time complexity.',
    difficulty: 'easy',
    order_index: 2
  },
  {
    id: 'cq-searching-003',
    video_id: 'video-searching-intro',
    topic: 'searching',
    question_text: 'What is the divide and conquer approach?',
    question_type: 'multiple_choice',
    options: { A: 'Splitting a problem into smaller subproblems and solving them', B: 'Multiplying numbers', C: 'Dividing by zero errors', D: 'Conquering bugs' },
    correct_answer: 'A',
    explanation: 'Divide and conquer breaks a big problem into smaller, manageable subproblems, solves each, and combines results.',
    difficulty: 'easy',
    order_index: 3
  },

  // Strings (3 questions)
  {
    id: 'cq-strings-001',
    video_id: 'video-strings-intro',
    topic: 'strings',
    question_text: 'In many languages, strings are immutable. What does this mean?',
    question_type: 'multiple_choice',
    options: { A: 'Cannot be converted to numbers', B: 'Cannot be changed after creation', C: 'Cannot be longer than 100 characters', D: 'Cannot be printed' },
    correct_answer: 'B',
    explanation: 'Immutable means once a string is created, it cannot be modified. Any operation that seems to modify creates a new string.',
    difficulty: 'easy',
    order_index: 1
  },
  {
    id: 'cq-strings-002',
    video_id: 'video-strings-intro',
    topic: 'strings',
    question_text: 'What is the two-pointer technique commonly used for?',
    question_type: 'multiple_choice',
    options: { A: 'Adding two numbers in a string', B: 'Checking palindromes and comparing characters from both ends', C: 'Multiplying strings', D: 'Sorting strings' },
    correct_answer: 'B',
    explanation: 'Two pointers start at opposite ends and move toward each other, useful for palindrome checking and similar problems.',
    difficulty: 'easy',
    order_index: 2
  },
  {
    id: 'cq-strings-003',
    video_id: 'video-strings-intro',
    topic: 'strings',
    question_text: 'What is a sliding window pattern?',
    question_type: 'multiple_choice',
    options: { A: 'A UI pattern for displaying text', B: 'Moving a fixed-size window across data to process substrings', C: 'An animation effect', D: 'A password pattern' },
    correct_answer: 'B',
    explanation: 'The sliding window pattern maintains a window of fixed size that moves through the data, useful for substring problems.',
    difficulty: 'easy',
    order_index: 3
  },

  // Heaps (3 questions)
  {
    id: 'cq-heaps-001',
    video_id: 'video-heaps-intro',
    topic: 'heaps',
    question_text: 'In a min-heap, where is the smallest element?',
    question_type: 'multiple_choice',
    options: { A: 'At the bottom', B: 'At the root (top)', C: 'Somewhere in the middle', D: 'In the left child only' },
    correct_answer: 'B',
    explanation: 'In a min-heap, the smallest element is always at the root because every parent is smaller than its children.',
    difficulty: 'easy',
    order_index: 1
  },
  {
    id: 'cq-heaps-002',
    video_id: 'video-heaps-intro',
    topic: 'heaps',
    question_text: 'What is the time complexity of inserting into a heap?',
    question_type: 'multiple_choice',
    options: { A: 'O(1)', B: 'O(n)', C: 'O(log n)', D: 'O(n log n)' },
    correct_answer: 'C',
    explanation: 'Inserting requires bubbling up the new element, which takes O(log n) time in a balanced heap.',
    difficulty: 'easy',
    order_index: 2
  },
  {
    id: 'cq-heaps-003',
    video_id: 'video-heaps-intro',
    topic: 'heaps',
    question_text: 'What is a priority queue used for?',
    question_type: 'multiple_choice',
    options: { A: 'Sorting files on a computer', B: 'Processing items based on priority rather than order inserted', C: 'Encrypting data', D: 'Deleting elements' },
    correct_answer: 'B',
    explanation: 'A priority queue processes items by priority — highest (or lowest) priority items are served first.',
    difficulty: 'easy',
    order_index: 3
  },

  // Linked Lists (3 questions)
  {
    id: 'cq-linked-lists-001',
    video_id: 'video-linked-lists-intro',
    topic: 'linked_lists',
    question_text: 'What does each node in a linked list contain?',
    question_type: 'multiple_choice',
    options: { A: 'Only data', B: 'Only a pointer to the next node', C: 'Data and a pointer to the next node', D: 'Two numbers' },
    correct_answer: 'C',
    explanation: 'Each node contains data and a pointer (reference) to the next node in the list.',
    difficulty: 'easy',
    order_index: 1
  },
  {
    id: 'cq-linked-lists-002',
    video_id: 'video-linked-lists-intro',
    topic: 'linked_lists',
    question_text: 'What is the time complexity of accessing an element by index in a linked list?',
    question_type: 'multiple_choice',
    options: { A: 'O(1)', B: 'O(log n)', C: 'O(n)', D: 'O(n²)' },
    correct_answer: 'C',
    explanation: 'To access by index, you must traverse from the head, counting positions until you reach the target — O(n) time.',
    difficulty: 'easy',
    order_index: 2
  },
  {
    id: 'cq-linked-lists-003',
    video_id: 'video-linked-lists-intro',
    topic: 'linked_lists',
    question_text: 'What is an advantage of linked lists over arrays?',
    question_type: 'multiple_choice',
    options: { A: 'Faster access by index', B: 'O(1) insertion at the beginning without shifting', C: 'Uses less memory overall', D: 'Sorted by default' },
    correct_answer: 'B',
    explanation: 'Linked lists allow O(1) insertion at the head because you only need to update one pointer, no shifting.',
    difficulty: 'easy',
    order_index: 3
  }
];

const codingExercises = [
  // Arrays (2 exercises)
  {
    id: 'ex-arrays-001',
    topic: 'arrays',
    type: 'fill_blank',
    difficulty: 'beginner',
    title: 'Find the Maximum Element',
    prompt: 'Complete the function to find the largest number in a list. Do not use the built-in max() function.',
    starter_code: `def find_max(nums):
    if not nums:
        return None
    max_val = nums[_]    # Start with the first element
    for i in range(_, len(nums)):    # Start loop from index 1
        if nums[i] _ max_val:        # Compare current with max
            max_val = _              # Update max
    return max_val`,
    solution: `def find_max(nums):
    if not nums:
        return None
    max_val = nums[0]
    for i in range(1, len(nums)):
        if nums[i] > max_val:
            max_val = nums[i]
    return max_val`,
    hints: ['Start by assuming the first element is the maximum', 'Loop from index 1 and compare each element'],
    test_input: '[3, 1, 4, 1, 5, 9, 2, 6]',
    expected_output: '9'
  },
  {
    id: 'ex-arrays-002',
    topic: 'arrays',
    type: 'fix_bug',
    difficulty: 'intermediate',
    title: 'Find Pairs That Sum to Target',
    prompt: 'Fix the bugs in this function to find all pairs that sum to the target. Each pair should be a list [a, b] where a + b equals target.',
    starter_code: `def find_pairs(nums, target):
    result = []
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                result.append([nums[i], nums[j]])
    return result
    
# Test: find_pairs([1, 2, 3, 4, 5], 6)`,
    solution: `def find_pairs(nums, target):
    result = []
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                result.append([nums[i], nums[j]])
    return result
    
# Test: find_pairs([1, 2, 3, 4, 5], 6)`,
    hints: ['The logic is correct! Just make sure to test it properly'],
    test_input: '[1, 2, 3, 4, 5], 6',
    expected_output: '[[1, 5], [2, 4]]'
  },

  // Trees (2 exercises)
  {
    id: 'ex-trees-001',
    topic: 'trees',
    type: 'fill_blank',
    difficulty: 'beginner',
    title: 'Calculate Tree Depth',
    prompt: 'Complete the recursive function to find the maximum depth of a binary tree.',
    starter_code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def maxDepth(root):
    if root is None:
        return _
    left_depth = maxDepth(root._)
    right_depth = maxDepth(root._)
    return max(left_depth, right_depth) + _`,
    solution: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def maxDepth(root):
    if root is None:
        return 0
    return 1 + max(maxDepth(root.left), maxDepth(root.right))`,
    hints: ['Base case: empty tree has depth 0', 'Depth of current node = 1 + max of children depths'],
    test_input: 'TreeNode(1, TreeNode(2, TreeNode(4), TreeNode(5)), TreeNode(3))',
    expected_output: '3'
  },
  {
    id: 'ex-trees-002',
    topic: 'trees',
    type: 'complete_function',
    difficulty: 'intermediate',
    title: 'Binary Tree Inorder Traversal',
    prompt: 'Complete the inorder traversal function to return values in left-root-right order.',
    starter_code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def inorderTraversal(root):
    result = []
    
    def traverse(node):
        if node is None:
            return
        traverse(node._)      # Visit left
        result.append(node._) # Visit root
        traverse(node._)      # Visit right
    
    traverse(root)
    return result
    
# Expected: [1, 3, 2] for tree 1->(3) <-2`,
    solution: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def inorderTraversal(root):
    result = []
    
    def traverse(node):
        if node is None:
            return
        traverse(node.left)
        result.append(node.val)
        traverse(node.right)
    
    traverse(root)
    return result`,
    hints: ['Inorder: left, then root, then right', 'Use recursion to traverse subtrees'],
    test_input: 'TreeNode(2, TreeNode(1), TreeNode(3))',
    expected_output: '[1, 2, 3]'
  },

  // Graphs (2 exercises)
  {
    id: 'ex-graphs-001',
    topic: 'graphs',
    type: 'fill_blank',
    difficulty: 'beginner',
    title: 'Count Connected Components',
    prompt: 'Complete the DFS function to count connected components in an adjacency list.',
    starter_code: `def countComponents(n, edges):
    # Build adjacency list
    graph = {i: [] for i in range(n)}
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    
    visited = set()
    count = 0
    
    def dfs(node):
        visited.add(node)
        for neighbor in graph[node]:
            if neighbor not in _:
                dfs(neighbor)
    
    for node in range(n):
        if node not in visited:
            dfs(node)
            count += _
    return _`,
    solution: `def countComponents(n, edges):
    graph = {i: [] for i in range(n)}
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    
    visited = set()
    count = 0
    
    def dfs(node):
        visited.add(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                dfs(neighbor)
    
    for node in range(n):
        if node not in visited:
            dfs(node)
            count += 1
    return count`,
    hints: ['Run DFS from each unvisited node', 'Increment count each time you start a new DFS'],
    test_input: '5, [[0, 1], [2, 3], [3, 4]]',
    expected_output: '2'
  },
  {
    id: 'ex-graphs-002',
    topic: 'graphs',
    type: 'fix_bug',
    difficulty: 'intermediate',
    title: 'BFS Shortest Path',
    prompt: 'Fix the BFS implementation to find the shortest path from source to destination.',
    starter_code: `from collections import deque

def shortestPath(n, graph, src, dst):
    queue = deque([(src, 0)])
    visited = {src}
    
    while queue:
        node, dist = queue.popleft()
        if node == dst:
            return dist
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, dist + _))  # Fix: distance should be 1 more
    
    return -1

# Test: shortestPath(4, {0:[1,2], 1:[3], 2:[3], 3:[]}, 0, 3)`,
    solution: `from collections import deque

def shortestPath(n, graph, src, dst):
    queue = deque([(src, 0)])
    visited = {src}
    
    while queue:
        node, dist = queue.popleft()
        if node == dst:
            return dist
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, dist + 1))
    
    return -1`,
    hints: ['BFS visits level by level', 'Each neighbor is one level deeper'],
    test_input: '4, {0:[1,2], 1:[3], 2:[3], 3:[]}, 0, 3',
    expected_output: '2'
  },

  // DP (2 exercises)
  {
    id: 'ex-dp-001',
    topic: 'dp',
    type: 'fill_blank',
    difficulty: 'beginner',
    title: 'Fibonacci Number',
    prompt: 'Complete the function to calculate the nth Fibonacci number using dynamic programming.',
    starter_code: `def fib(n):
    if n <= 1:
        return n
    
    dp = [0] * (n + 1)
    dp[1] = 1
    
    for i in range(2, n + 1):
        dp[i] = dp[i - _] + dp[i - _]
    
    return dp[_]`,
    solution: `def fib(n):
    if n <= 1:
        return n
    
    dp = [0] * (n + 1)
    dp[1] = 1
    
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    
    return dp[n]`,
    hints: ['Fibonacci: each number is sum of previous two', 'dp[i] = dp[i-1] + dp[i-2]'],
    test_input: '10',
    expected_output: '55'
  },
  {
    id: 'ex-dp-002',
    topic: 'dp',
    type: 'complete_function',
    difficulty: 'intermediate',
    title: 'Climbing Stairs',
    prompt: 'Complete the function to count ways to reach the top of n stairs if you can take 1 or 2 steps at a time.',
    starter_code: `def climbStairs(n):
    if n == 1:
        return 1
    
    dp = [0] * (n + 1)
    dp[1] = 1
    dp[2] = 2
    
    for i in range(3, n + 1):
        dp[i] = dp[i - _] + dp[i - _]
    
    return dp[_]`,
    solution: `def climbStairs(n):
    if n == 1:
        return 1
    
    dp = [0] * (n + 1)
    dp[1] = 1
    dp[2] = 2
    
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    
    return dp[n]`,
    hints: ['Ways to reach step i = ways to reach (i-1) + ways to reach (i-2)', 'Base: 1 way to reach 1, 2 ways to reach 2'],
    test_input: '5',
    expected_output: '8'
  },

  // Recursion (2 exercises)
  {
    id: 'ex-recursion-001',
    topic: 'recursion',
    type: 'fill_blank',
    difficulty: 'beginner',
    title: 'Factorial',
    prompt: 'Complete the recursive function to calculate factorial.',
    starter_code: `def factorial(n):
    # Base case
    if n <= _:
        return 1
    
    # Recursive case
    return n * factorial(n - _)`,
    solution: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)`,
    hints: ['Base case: factorial(1) = 1', 'Recursive case: n! = n * (n-1)!'],
    test_input: '5',
    expected_output: '120'
  },
  {
    id: 'ex-recursion-002',
    topic: 'recursion',
    type: 'complete_function',
    difficulty: 'intermediate',
    title: 'Sum of Digits',
    prompt: 'Complete the recursive function to find the sum of all digits in a number.',
    starter_code: `def sumDigits(n):
    # Base case: single digit
    if n < 10:
        return _
    
    # Recursive case: last digit + sum of rest
    return (n % _) + sumDigits(n // _)`,
    solution: `def sumDigits(n):
    if n < 10:
        return n
    return (n % 10) + sumDigits(n // 10)`,
    hints: ['n % 10 gives the last digit', 'n // 10 removes the last digit'],
    test_input: '12345',
    expected_output: '15'
  },

  // Sorting (2 exercises)
  {
    id: 'ex-sorting-001',
    topic: 'sorting',
    type: 'fill_blank',
    difficulty: 'beginner',
    title: 'Bubble Sort',
    prompt: 'Complete the bubble sort function to sort an array in ascending order.',
    starter_code: `def bubbleSort(arr):
    n = len(arr)
    
    for i in range(n):
        for j in range(0, n - i - _):
            if arr[j] > arr[j + _]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    
    return arr`,
    solution: `def bubbleSort(arr):
    n = len(arr)
    
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    
    return arr`,
    hints: ['Compare adjacent elements', 'Swap if left > right'],
    test_input: '[5, 2, 8, 1, 9]',
    expected_output: '[1, 2, 5, 8, 9]'
  },
  {
    id: 'ex-sorting-002',
    topic: 'sorting',
    type: 'complete_function',
    difficulty: 'intermediate',
    title: 'Selection Sort',
    prompt: 'Complete the selection sort function to sort an array in ascending order.',
    starter_code: `def selectionSort(arr):
    n = len(arr)
    
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        
        arr[i], arr[min_idx] = arr[min_idx], arr[_]
    
    return arr`,
    solution: `def selectionSort(arr):
    n = len(arr)
    
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    
    return arr`,
    hints: ['Find minimum in unsorted portion', 'Swap with first unsorted position'],
    test_input: '[64, 25, 12, 22, 11]',
    expected_output: '[11, 12, 22, 25, 64]'
  },

  // Searching (2 exercises)
  {
    id: 'ex-searching-001',
    topic: 'searching',
    type: 'fill_blank',
    difficulty: 'beginner',
    title: 'Binary Search',
    prompt: 'Complete the binary search function to find target in a sorted array. Return the index if found, -1 otherwise.',
    starter_code: `def binarySearch(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return _
        elif arr[mid] < target:
            left = mid + _
        else:
            right = mid - _
    
    return _`,
    solution: `def binarySearch(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1`,
    hints: ['Compare mid element with target', 'Adjust left or right based on comparison'],
    test_input: '[1, 2, 3, 4, 5, 6, 7, 8, 9], 5',
    expected_output: '4'
  },
  {
    id: 'ex-searching-002',
    topic: 'searching',
    type: 'fix_bug',
    difficulty: 'intermediate',
    title: 'Find First and Last Position',
    prompt: 'Fix the function to find the first and last position of target in a sorted array.',
    starter_code: `def findFirstLast(nums, target):
    def findBound(goFirst):
        start, end = 0, len(nums) - 1
        while start <= end:
            mid = (start + end) // 2
            if nums[mid] == target:
                if goFirst:
                    if mid == 0 or nums[mid - 1] < target:
                        return mid
                    end = mid - _
                else:
                    if mid == len(nums) - 1 or nums[mid + 1] > target:
                        return mid
                    start = mid + _
            elif nums[mid] < target:
                start = mid + _
            else:
                end = mid - _
        return -1
    
    return [findBound(True), findBound(False)]

# Test: findFirstLast([5, 7, 7, 8, 8, 10], 8)`,
    solution: `def findFirstLast(nums, target):
    def findBound(goFirst):
        start, end = 0, len(nums) - 1
        while start <= end:
            mid = (start + end) // 2
            if nums[mid] == target:
                if goFirst:
                    if mid == 0 or nums[mid - 1] < target:
                        return mid
                    end = mid - 1
                else:
                    if mid == len(nums) - 1 or nums[mid + 1] > target:
                        return mid
                    start = mid + 1
            elif nums[mid] < target:
                start = mid + 1
            else:
                end = mid - 1
        return -1
    
    return [findBound(True), findBound(False)]`,
    hints: ['Use two binary searches — one for first, one for last', 'When found, continue searching in appropriate direction'],
    test_input: '[5, 7, 7, 8, 8, 10], 8',
    expected_output: '[3, 4]'
  },

  // Strings (2 exercises)
  {
    id: 'ex-strings-001',
    topic: 'strings',
    type: 'fill_blank',
    difficulty: 'beginner',
    title: 'Reverse a String',
    prompt: 'Complete the two-pointer function to reverse a string.',
    starter_code: `def reverseString(s):
    s = list(s)
    left, right = 0, len(s) - 1
    
    while left < right:
        s[left], s[right] = s[right], s[left]
        left += _
        right -= _
    
    return ''.join(s)`,
    solution: `def reverseString(s):
    s = list(s)
    left, right = 0, len(s) - 1
    
    while left < right:
        s[left], s[right] = s[right], s[left]
        left += 1
        right -= 1
    
    return ''.join(s)`,
    hints: ['Swap characters from both ends', 'Move pointers toward center'],
    test_input: '"hello"',
    expected_output: '"olleh"'
  },
  {
    id: 'ex-strings-002',
    topic: 'strings',
    type: 'complete_function',
    difficulty: 'intermediate',
    title: 'Check Palindrome',
    prompt: 'Complete the function to check if a string is a palindrome (ignoring non-alphanumeric characters).',
    starter_code: `def isPalindrome(s):
    # Clean the string: keep only alphanumeric
    clean = ''
    for c in s.lower():
        if c.isalnum():
            clean += c
    
    # Two-pointer check
    left, right = 0, len(clean) - 1
    
    while left < right:
        if clean[left] != clean[right]:
            return _
        left += _
        right -= _
    
    return _

# Test: isPalindrome("A man, a plan, a canal: Panama")`,
    solution: `def isPalindrome(s):
    clean = ''
    for c in s.lower():
        if c.isalnum():
            clean += c
    
    left, right = 0, len(clean) - 1
    
    while left < right:
        if clean[left] != clean[right]:
            return False
        left += 1
        right -= 1
    
    return True`,
    hints: ['First clean the string', 'Then use two-pointer comparison'],
    test_input: '"A man, a plan, a canal: Panama"',
    expected_output: 'True'
  },

  // Heaps (2 exercises)
  {
    id: 'ex-heaps-001',
    topic: 'heaps',
    type: 'fill_blank',
    difficulty: 'beginner',
    title: 'Find Kth Largest Element',
    prompt: 'Complete the function to find the kth largest element using a simple sort approach.',
    starter_code: `import heapq

def findKthLargest(nums, k):
    # Sort in descending order
    nums.sort(reverse=_)
    return nums[_]`,
    solution: `import heapq

def findKthLargest(nums, k):
    nums.sort(reverse=True)
    return nums[k - 1]`,
    hints: ['Sort descending', 'Return kth element (index k-1)'],
    test_input: '[3, 1, 4, 1, 5, 9, 2, 6], 3',
    expected_output: '5'
  },
  {
    id: 'ex-heaps-002',
    topic: 'heaps',
    type: 'complete_function',
    difficulty: 'intermediate',
    title: 'Kth Smallest in Matrix',
    prompt: 'Complete the function to find the kth smallest element in a sorted matrix.',
    starter_code: `import heapq

def kthSmallest(matrix, k):
    n = len(matrix)
    # Min-heap with starting position
    heap = [(matrix[0][0], 0, 0)]
    visited = set()
    
    while heap:
        val, row, col = heap.pop()
        k -= 1
        
        if k == 0:
            return _
        
        # Add right neighbor
        if col + 1 < n and (row, col + 1) not in visited:
            heapq.heappush(heap, (matrix[row][col + 1], row, col + 1))
            visited.add((row, col + 1))
        
        # Add below neighbor
        if row + 1 < n and (row + 1, col) not in visited:
            heapq.heappush(heap, (matrix[row + 1][col], row + 1, col))
            visited.add((row + 1, col))
    
    return -1
    
# Test: kthSmallest([[1,5,9],[4,6,10],[7,8,11]], 5)`,
    solution: `import heapq

def kthSmallest(matrix, k):
    n = len(matrix)
    heap = [(matrix[0][0], 0, 0)]
    visited = set()
    
    while heap:
        val, row, col = heap.pop()
        k -= 1
        
        if k == 0:
            return val
        
        if col + 1 < n and (row, col + 1) not in visited:
            heapq.heappush(heap, (matrix[row][col + 1], row, col + 1))
            visited.add((row, col + 1))
        
        if row + 1 < n and (row + 1, col) not in visited:
            heapq.heappush(heap, (matrix[row + 1][col], row + 1, col))
            visited.add((row + 1, col))
    
    return -1`,
    hints: ['Use a min-heap to always get smallest', 'Add right and below neighbors'],
    test_input: '[[1,5,9],[4,6,10],[7,8,11]], 5',
    expected_output: '6'
  },

  // Linked Lists (2 exercises)
  {
    id: 'ex-linked-lists-001',
    topic: 'linked_lists',
    type: 'fill_blank',
    difficulty: 'beginner',
    title: 'Reverse Linked List',
    prompt: 'Complete the iterative function to reverse a linked list.',
    starter_code: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverseList(head):
    prev = None
    curr = head
    
    while curr:
        next_temp = curr._  # Save next
        curr._ = prev       # Reverse pointer
        prev = curr
        curr = next_temp
    
    return _`,
    solution: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverseList(head):
    prev = None
    curr = head
    
    while curr:
        next_temp = curr.next
        curr.next = prev
        prev = curr
        curr = next_temp
    
    return prev`,
    hints: ['Save next before reversing', 'Move prev and curr forward'],
    test_input: '[1, 2, 3, 4, 5]',
    expected_output: '[5, 4, 3, 2, 1]'
  },
  {
    id: 'ex-linked-lists-002',
    topic: 'linked_lists',
    type: 'complete_function',
    difficulty: 'intermediate',
    title: 'Find Middle of Linked List',
    prompt: 'Complete the function to find the middle node of a linked list. For odd length, return the middle. For even, return the second middle.',
    starter_code: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def middleNode(head):
    slow = head
    fast = head
    
    while fast and fast._:
        slow = slow._
        fast = fast._._
    
    return _

# For [1,2,3,4,5], return node at position 3`,
    solution: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def middleNode(head):
    slow = head
    fast = head
    
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    
    return slow`,
    hints: ['Slow moves 1 step, fast moves 2 steps', 'When fast reaches end, slow is at middle'],
    test_input: '[1, 2, 3, 4, 5]',
    expected_output: '3'
  }
];

async function seed() {
  console.log('Seeding video lessons...');
  const { error: videoError } = await supabase
    .from('video_lessons')
    .upsert(videoLessons, { onConflict: 'id' });
  if (videoError) {
    console.error('Error seeding video lessons:', videoError);
  } else {
    console.log('✅ 10 videos seeded');
  }

  console.log('Seeding concept questions...');
  const { error: questionError } = await supabase
    .from('concept_questions')
    .upsert(conceptQuestions, { onConflict: 'id' });
  if (questionError) {
    console.error('Error seeding concept questions:', questionError);
  } else {
    console.log('✅ 30 questions seeded');
  }

  console.log('Seeding coding exercises...');
  const { error: exerciseError } = await supabase
    .from('coding_exercises')
    .upsert(codingExercises, { onConflict: 'id' });
  if (exerciseError) {
    console.error('Error seeding coding exercises:', exerciseError);
  } else {
    console.log('✅ 20 exercises seeded');
  }

  console.log('Done! Learning content ready.');
}

seed();