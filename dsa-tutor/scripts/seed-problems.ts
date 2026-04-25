import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const problems = [

  // ─── ARRAYS ───────────────────────────────────────────────
  {
    id: 'arrays-001',
    title: 'Two Sum',
    topic: 'arrays',
    difficulty: 'Easy',
    description: 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. Each input has exactly one solution. You may not use the same element twice.',
    examples: [
      { input: 'nums=[2,7,11,15], target=9', output: '[0,1]', explanation: 'nums[0]+nums[1]=2+7=9, which equals the target.' },
      { input: 'nums=[3,2,4], target=6', output: '[1,2]', explanation: 'nums[1]+nums[2]=2+4=6.' }
    ],
    hints: [
      'For each element x, consider what number you would need to pair with it to reach the target.',
      'A hash map lets you store each number you have seen so far and check if its complement exists in O(1) time.',
      'Iterate through the array. For each x, check if (target - x) is in your hash map. If found, return both indices.'
    ],
    solution: 'def twoSum(nums, target):\n    seen = {}\n    for i, x in enumerate(nums):\n        complement = target - x\n        if complement in seen:\n            return [seen[complement], i]\n        seen[x] = i\n    return []',
    time_complexity: 'O(n)',
    space_complexity: 'O(n)',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft']
  },
  {
    id: 'arrays-002',
    title: 'Maximum Subarray',
    topic: 'arrays',
    difficulty: 'Medium',
    description: 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum. The array may contain negative numbers.',
    examples: [
      { input: 'nums=[-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum of 6.' },
      { input: 'nums=[1]', output: '1', explanation: 'The subarray [1] is the only choice and has sum 1.' }
    ],
    hints: [
      'As you iterate through the array, think about whether to extend the current subarray or start a fresh one.',
      'Kadane\'s algorithm: at each position, decide whether to take the previous sum plus the current element, or start fresh from the current element.',
      'Track current_sum = max(num, current_sum + num) and best_sum = max(best_sum, current_sum). Return best_sum.'
    ],
    solution: 'def maxSubArray(nums):\n    cur = best = nums[0]\n    for n in nums[1:]:\n        cur = max(n, cur + n)\n        best = max(best, cur)\n    return best',
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    companies: ['Amazon', 'Google', 'Apple', 'Microsoft']
  },
  {
    id: 'arrays-003',
    title: 'Trapping Rain Water',
    topic: 'arrays',
    difficulty: 'Hard',
    description: 'Given an array of non-negative integers height where each element represents the height of a bar in a 1-unit wide grid, compute how much water can be trapped after raining. Water trapped at each index equals min(max_left, max_right) - height[i]. Use O(1) extra space.',
    examples: [
      { input: 'height=[0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: 'The cross-section shows 6 units of water can be trapped between the bars.' },
      { input: 'height=[4,2,0,3,2,5]', output: '9', explanation: 'Water is trapped between heights 4 and 3, and 3 and 5.' }
    ],
    hints: [
      'Think about the water level at each position — it is bounded by the minimum of the highest bar on both sides, minus the bar height.',
      'Two-pointer approach: track max from left and right simultaneously, processing from the side with the smaller max.',
      'Use two pointers left and right. If height[left] < height[right], then water is limited by max_left. Move pointers inward, updating maxes.'
    ],
    solution: 'def trap(height):\n    if not height: return 0\n    left, right = 0, len(height) - 1\n    max_left = max_right = 0\n    water = 0\n    while left < right:\n        if height[left] < height[right]:\n            if height[left] >= max_left:\n                max_left = height[left]\n            else:\n                water += max_left - height[left]\n            left += 1\n        else:\n            if height[right] >= max_right:\n                max_right = height[right]\n            else:\n                water += max_right - height[right]\n            right -= 1\n    return water',
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft']
  },

  // ─── TREES ───────────────────────────────────────────────
  {
    id: 'trees-001',
    title: 'Maximum Depth of Binary Tree',
    topic: 'trees',
    difficulty: 'Easy',
    description: 'Given the root of a binary tree represented as nested lists (LeetCode format), return its maximum depth. A binary tree\'s maximum depth is the number of nodes along the longest path from the root down to the farthest leaf node.',
    examples: [
      { input: 'root=[3,9,20,null,null,15,7]', output: '3', explanation: 'The longest path is 3 → 20 → 15 (or 3 → 20 → 7), with 3 nodes.' },
      { input: 'root=[1,null,2]', output: '2', explanation: 'Only one branch exists with 2 nodes.' }
    ],
    hints: [
      'Think about the depth as: 1 for the current node plus the depth of its deeper child subtree.',
      'Depth-first search (DFS) with recursion naturally computes this. The depth of a node is 1 plus the maximum depth of its children.',
      'Base case: if node is null, return 0. Recursive case: return 1 + max(maxDepth(left), maxDepth(right)).'
    ],
    solution: 'def maxDepth(root):\n    if not root: return 0\n    return 1 + max(maxDepth(root[1]) if len(root) > 1 and root[1] else 0,\n                    maxDepth(root[2]) if len(root) > 2 and root[2] else 0)',
    time_complexity: 'O(n)',
    space_complexity: 'O(h)',
    companies: ['Amazon', 'Google', 'Meta']
  },
  {
    id: 'trees-002',
    title: 'Binary Tree Level Order Traversal',
    topic: 'trees',
    difficulty: 'Medium',
    description: 'Given the root of a binary tree, return the level order traversal of its nodes\' values as a list of lists, where each inner list contains the values at that level from left to right. Use BFS with a queue.',
    examples: [
      { input: 'root=[3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]', explanation: 'Level 0: [3], Level 1: [9,20], Level 2: [15,7].' },
      { input: 'root=[1]', output: '[[1]]', explanation: 'Only one node at level 0.' }
    ],
    hints: [
      'Level order means visiting all nodes at depth d before moving to depth d+1 — like scanning row by row.',
      'Use a queue (BFS). Process all nodes at the current level, then prepare their children for the next level.',
      'Add root to queue. While queue not empty: record size, dequeue that many nodes, add their values and enqueue their children.'
    ],
    solution: 'from collections import deque\ndef levelOrder(root):\n    if not root: return []\n    q, res = deque([root]), []\n    while q:\n        level = []\n        for _ in range(len(q)):\n            node = q.popleft()\n            level.append(node[0])\n            for child in node[1:]:\n                if child: q.append(child)\n        res.append(level)\n    return res',
    time_complexity: 'O(n)',
    space_complexity: 'O(n)',
    companies: ['Amazon', 'Microsoft', 'Google', 'Meta']
  },
  {
    id: 'trees-003',
    title: 'Binary Tree Maximum Path Sum',
    topic: 'trees',
    difficulty: 'Hard',
    description: 'Given the root of a binary tree represented as nested lists, return the maximum path sum. A path is a sequence of nodes where each pair of adjacent nodes is connected by an edge. The path does not need to go through the root, and must contain at least one node.',
    examples: [
      { input: 'root=[-10,9,20,null,null,15,7]', output: '42', explanation: 'The path 15 → 20 → 7 has sum 42.' },
      { input: 'root=[2,-1]', output: '2', explanation: 'The path is just the node with value 2.' }
    ],
    hints: [
      'A path that ends at a node can either come from its left child, right child, or be just the node itself.',
      'For each node, compute the best path sum that goes from that node downward. Track the global maximum as you go.',
      'Use recursion. For each node: best_down = max(node_val, node_val + max(left, right)). Update global max with node_val + max(0, left) + max(0, right).'
    ],
    solution: 'def maxPathSum(root):\n    def dfs(node):\n        if not node: return 0\n        left = max(dfs(node[1]) if len(node) > 1 and node[1] else 0\n        right = max(dfs(node[2]) if len(node) > 2 and node[2] else 0\n        nonlocal_max[0] = max(nonlocal_max[0], node[0] + max(0, left) + max(0, right))\n        return node[0] + max(0, max(left, right))\n    nonlocal_max = [float(\"-inf\")]\n    dfs(root)\n    return nonlocal_max[0]',
    time_complexity: 'O(n)',
    space_complexity: 'O(h)',
    companies: ['Google', 'Meta', 'Microsoft', 'Amazon']
  },

  // ─── GRAPHS ───────────────────────────────────────────────
  {
    id: 'graphs-001',
    title: 'Number of Islands',
    topic: 'graphs',
    difficulty: 'Easy',
    description: 'Given an m x n 2D binary grid map representing land (\'1\') and water (\'0\'), count the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
    examples: [
      { input: 'grid=[["1","1","0"],["0","1","0"],["0","0","1"]]', output: '2', explanation: 'Two islands: one at top-left and one at bottom-right.' },
      { input: 'grid=[["1","1"],["1","1"]]', output: '1', explanation: 'All cells connect to form one island.' }
    ],
    hints: [
      'Every unvisited land cell you encounter could be the start of a new island.',
      'Use DFS or BFS from each new land cell to mark all connected land as visited so you do not count it twice.',
      'Iterate through every cell. When you find "1", increment count and run DFS to mark all connected "1"s as "0".'
    ],
    solution: 'def numIslands(grid):\n    if not grid: return 0\n    count = 0\n    def dfs(i, j):\n        if i < 0 or i >= len(grid) or j < 0 or j >= len(grid[0]) or grid[i][j] != "1": return\n        grid[i][j] = "0"\n        for di, dj in [(0,1),(0,-1),(1,0),(-1,0)]: dfs(i+di, j+dj)\n    for i in range(len(grid)):\n        for j in range(len(grid[0])):\n            if grid[i][j] == "1":\n                count += 1\n                dfs(i, j)\n    return count',
    time_complexity: 'O(m*n)',
    space_complexity: 'O(m*n)',
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft']
  },
  {
    id: 'graphs-002',
    title: 'Course Schedule',
    topic: 'graphs',
    difficulty: 'Medium',
    description: 'There are numCourses courses labeled from 0 to numCourses-1. Some courses have prerequisites given as pairs [a, b] where you must take course b before course a. Return true if you can finish all courses.',
    examples: [
      { input: 'numCourses=2, prerequisites=[[1,0]]', output: 'true', explanation: 'Take course 0 first, then course 1.' },
      { input: 'numCourses=2, prerequisites=[[1,0],[0,1]]', output: 'false', explanation: 'Cycle: 0 depends on 1, 1 depends on 0 — impossible.' }
    ],
    hints: [
      'This is a classic cycle detection problem on a directed graph. If a cycle exists, you cannot complete all courses.',
      'Use topological sort with DFS. Track three states per node: unvisited, in-progress (in current recursion stack), done.',
      'Build adjacency list. DFS: return false if you reach an in-progress node (cycle). Mark node done when fully processed.'
    ],
    solution: 'def canFinish(numCourses, prerequisites):\n    graph = [[] for _ in range(numCourses)]\n    for a, b in prerequisites: graph[b].append(a)\n    state = [0] * numCourses\n    def dfs(node):\n        if state[node] == 1: return False\n        if state[node] == 2: return True\n        state[node] = 1\n        for nb in graph[node]:\n            if not dfs(nb): return False\n        state[node] = 2\n        return True\n    return all(dfs(i) for i in range(numCourses))',
    time_complexity: 'O(V+E)',
    space_complexity: 'O(V+E)',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft']
  },
  {
    id: 'graphs-003',
    title: 'Word Ladder',
    topic: 'graphs',
    difficulty: 'Hard',
    description: 'Given a beginWord, an endWord, and a wordList, find the length of the shortest transformation sequence from beginWord to endWord. Change only one letter at a time, and each intermediate word must exist in wordList. Return 0 if no path exists.',
    examples: [
      { input: 'beginWord="hit", endWord="cog", wordList=["hot","dot","dog","lot","log","cog"]', output: '5', explanation: 'hit → hot → dot → dog → cog has length 5.' },
      { input: 'beginWord="hit", endWord="cog", wordList=["hot","dot","dog","lot","log"]', output: '0', explanation: 'No path exists to reach cog.' }
    ],
    hints: [
      'Each word is a node. Two words are connected if they differ by exactly one letter. You need the shortest path.',
      'Breadth-first search (BFS) starting from beginWord finds the shortest transformation sequence.',
      'Use BFS with a queue. For each word, generate all possible one-letter variations. If a word is in the list, add to queue and remove from list to avoid revisiting.'
    ],
    solution: 'from collections import deque\ndef ladderLength(beginWord, endWord, wordList):\n    wordSet = set(wordList)\n    if endWord not in wordSet: return 0\n    q = deque([(beginWord, 1)])\n    wordSet.discard(beginWord)\n    while q:\n        word, length = q.popleft()\n        if word == endWord: return length\n        for i in range(len(word)):\n            for c in \"abcdefghijklmnopqrstuvwxyz\":\n                new_word = word[:i] + c + word[i+1:]\n                if new_word in wordSet:\n                    wordSet.discard(new_word)\n                    q.append((new_word, length + 1))\n    return 0',
    time_complexity: 'O(N * L * 26)',
    space_complexity: 'O(N)',
    companies: ['Amazon', 'Google', 'Meta']
  },

  // ─── DYNAMIC PROGRAMMING ──────────────────────────────────
  {
    id: 'dp-001',
    title: 'Climbing Stairs',
    topic: 'dp',
    difficulty: 'Easy',
    description: 'You are climbing a staircase with n steps. Each time you can climb either 1 step or 2 steps. In how many distinct ways can you climb to the top?',
    examples: [
      { input: 'n=2', output: '2', explanation: 'Two ways: 1+1 or 2.' },
      { input: 'n=3', output: '3', explanation: 'Three ways: 1+1+1, 1+2, 2+1.' }
    ],
    hints: [
      'To reach step n, you must have come from step n-1 (climbing 1) or step n-2 (climbing 2).',
      'ways(n) = ways(n-1) + ways(n-2). This is exactly the Fibonacci sequence.',
      'Base cases: n=1 returns 1, n=2 returns 2. Iterate, keeping track of only the previous two values.'
    ],
    solution: 'def climbStairs(n):\n    if n <= 2: return n\n    a, b = 1, 2\n    for _ in range(2, n):\n        a, b = b, a + b\n    return b',
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    companies: ['Amazon', 'Google', 'Apple', 'Adobe']
  },
  {
    id: 'dp-002',
    title: 'Coin Change',
    topic: 'dp',
    difficulty: 'Medium',
    description: 'Given an array of coin denominations (positive integers) and an amount, return the minimum number of coins needed to make up that amount. If it is impossible, return -1.',
    examples: [
      { input: 'coins=[1,5,6,9], amount=11', output: '2', explanation: 'Use 5 + 6 = 11, which is 2 coins (minimum).' },
      { input: 'coins=[2], amount=3', output: '-1', explanation: 'Cannot make amount 3 with coin denomination 2.' }
    ],
    hints: [
      'Try every possible coin as the last coin. The answer for amount A is the minimum of (1 + answer for amount A - coin).',
      'Use bottom-up DP: dp[i] = minimum coins to make amount i. Initialize dp[0] = 0.',
      'For each amount from 1 to target, try each coin: if coin <= amount, dp[amount] = min(dp[amount], dp[amount-coin] + 1).'
    ],
    solution: 'def coinChange(coins, amount):\n    dp = [float(\"inf\")] * (amount + 1)\n    dp[0] = 0\n    for i in range(1, amount + 1):\n        for c in coins:\n            if c <= i:\n                dp[i] = min(dp[i], dp[i - c] + 1)\n    return dp[amount] if dp[amount] != float(\"inf\") else -1',
    time_complexity: 'O(amount * len(coins))',
    space_complexity: 'O(amount)',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft']
  },
  {
    id: 'dp-003',
    title: 'Longest Increasing Subsequence',
    topic: 'dp',
    difficulty: 'Hard',
    description: 'Given an integer array nums, return the length of the longest strictly increasing subsequence. A subsequence is a sequence derived from the array by deleting some elements without changing the order.',
    examples: [
      { input: 'nums=[10,9,2,5,3,7,101,18]', output: '4', explanation: 'LIS is [2,3,7,101] with length 4.' },
      { input: 'nums=[0,1,0,3,2,3]', output: '4', explanation: 'LIS is [0,1,3,3] or [0,1,2,3], length 4.' }
    ],
    hints: [
      'For each element, consider it as the potential end of an increasing subsequence.',
      'The O(n log n) approach uses patience sorting. Maintain a tails array of the smallest tail for subsequences of each length.',
      'Binary search to find where to insert each number. If larger than all tails, append. Else, replace the first larger element.'
    ],
    solution: 'import bisect\ndef lengthOfLIS(nums):\n    tails = []\n    for num in nums:\n        pos = bisect.bisect_left(tails, num)\n        if pos == len(tails):\n            tails.append(num)\n        else:\n            tails[pos] = num\n    return len(tails)',
    time_complexity: 'O(n log n)',
    space_complexity: 'O(n)',
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta']
  },

  // ─── RECURSION ────────────────────────────────────────────
  {
    id: 'recursion-001',
    title: 'Fibonacci Number',
    topic: 'recursion',
    difficulty: 'Easy',
    description: 'Given an integer n, return the nth Fibonacci number. The Fibonacci sequence is defined as: F(0) = 0, F(1) = 1, and F(n) = F(n-1) + F(n-2) for n >= 2.',
    examples: [
      { input: 'n=2', output: '1', explanation: 'F(2) = F(1) + F(0) = 1 + 0 = 1.' },
      { input: 'n=4', output: '3', explanation: 'F(4) = F(3) + F(2) = 2 + 1 = 3.' }
    ],
    hints: [
      'Each Fibonacci number depends on the two numbers before it.',
      'Use recursion with memoization (top-down DP) or iterate with bottom-up DP to avoid exponential time.',
      'Base cases: n=0 returns 0, n=1 returns 1. Use a dictionary to cache computed values.'
    ],
    solution: 'def fib(n, memo={}):\n    if n in memo: return memo[n]\n    if n <= 1: return n\n    memo[n] = fib(n-1, memo) + fib(n-2, memo)\n    return memo[n]',
    time_complexity: 'O(n)',
    space_complexity: 'O(n)',
    companies: ['Amazon', 'Google', 'Apple']
  },
  {
    id: 'recursion-002',
    title: 'Generate Parentheses',
    topic: 'recursion',
    difficulty: 'Medium',
    description: 'Given n pairs of parentheses, generate all combinations of well-formed parentheses. A well-formed string has balanced and properly ordered parentheses.',
    examples: [
      { input: 'n=1', output: '["()"]', explanation: 'Only one valid arrangement.' },
      { input: 'n=2', output: '["(())","()()"]', explanation: 'Two valid arrangements.' }
    ],
    hints: [
      'At any point, you can add an opening parenthesis if you have not used n yet.',
      'You can add a closing parenthesis only if it would not exceed the number of opening parentheses used.',
      'Backtrack: add "(" if open < n, add ")" if close < open. When open == close == n, add result.'
    ],
    solution: 'def generateParenthesis(n):\n    result = []\n    def backtrack(open, close, path):\n        if len(path) == 2 * n:\n            result.append(path)\n            return\n        if open < n:\n            backtrack(open + 1, close, path + \"(\")\n        if close < open:\n            backtrack(open, close + 1, path + \")\")\n    backtrack(0, 0, \"\")\n    return result',
    time_complexity: 'O(4^n / n^(1/2))',
    space_complexity: 'O(n)',
    companies: ['Google', 'Meta', 'Amazon', 'Microsoft']
  },
  {
    id: 'recursion-003',
    title: 'N-Queens',
    topic: 'recursion',
    difficulty: 'Hard',
    description: 'The n-Queens puzzle is the problem of placing n queens on an n×n chessboard so that no two queens can attack each other. Return all distinct solutions, each as a list of strings representing the board.',
    examples: [
      { input: 'n=1', output: '["Q"]', explanation: 'A single queen can be placed anywhere.' },
      { input: 'n=2', output: '[]', explanation: 'No solution exists for n=2.' }
    ],
    hints: [
      'Queens attack along rows, columns, and diagonals. You must ensure no two queens share the same row, column, or diagonal.',
      'Use backtracking. Place queens row by row. Track which columns and diagonals are occupied.',
      'Use sets for columns and diagonals. Diagonal: (row-col) and (row+col) identify diagonals. Recurse row by row.'
    ],
    solution: 'def solveNQueens(n):\n    cols = set()\n    pos_diag = set()\n    neg_diag = set()\n    result = []\n    board = [\"-\" * n for _ in range(n)]\n    def backtrack(row):\n        if row == n:\n            result.append(list(board))\n            return\n        for col in range(n):\n            if col in cols or (row - col) in pos_diag or (row + col) in neg_diag:\n                continue\n            cols.add(col)\n            pos_diag.add(row - col)\n            neg_diag.add(row + col)\n            board[row] = board[row][:col] + \"Q\" + board[row][col+1:]\n            backtrack(row + 1)\n            cols.remove(col)\n            pos_diag.remove(row - col)\n            neg_diag.remove(row + col)\n            board[row] = \"-\" * n\n    backtrack(0)\n    return result',
    time_complexity: 'O(n!)',
    space_complexity: 'O(n)',
    companies: ['Google', 'Amazon', 'Meta']
  },

  // ─── SORTING ──────────────────────────────────────────────
  {
    id: 'sorting-001',
    title: 'Merge Sorted Array',
    topic: 'sorting',
    difficulty: 'Easy',
    description: 'Given two sorted integer arrays nums1 and nums2, merge nums2 into nums1 in-place as a sorted array. nums1 has enough space at the end to hold nums2 elements.',
    examples: [
      { input: 'nums1=[1,2,3,0,0,0], m=3, nums2=[2,5,6], n=3', output: '[1,2,2,3,5,6]', explanation: 'Merge the two sorted arrays into one.' },
      { input: 'nums1=[1], m=1, nums2=[], n=0', output: '[1]', explanation: 'nums2 is empty.' }
    ],
    hints: [
      'Work from the back of both arrays to avoid overwriting elements you still need.',
      'Use three pointers: one at the end of valid nums1, one at the end of nums2, one at the end of total space.',
      'Compare elements at the two pointers. Place the larger element at the end of nums1. Move inward.'
    ],
    solution: 'def merge(nums1, m, nums2, n):\n    i, j, k = m - 1, n - 1, m + n - 1\n    while j >= 0:\n        if i >= 0 and nums1[i] > nums2[j]:\n            nums1[k] = nums1[i]\n            i -= 1\n        else:\n            nums1[k] = nums2[j]\n            j -= 1\n        k -= 1',
    time_complexity: 'O(m+n)',
    space_complexity: 'O(1)',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft']
  },
  {
    id: 'sorting-002',
    title: 'Sort Colors',
    topic: 'sorting',
    difficulty: 'Medium',
    description: 'Given an array nums with n objects colored 0, 1, or 2 (red, white, blue), sort them in-place so that all 0s come first, then 1s, then 2s. Use the Dutch National Flag algorithm with O(1) space.',
    examples: [
      { input: 'nums=[2,0,2,1,1,0]', output: '[0,0,1,1,2,2]', explanation: 'Sorted by color: 0s (red), 1s (white), 2s (blue).' },
      { input: 'nums=[2,2,1,0]', output: '[0,1,2,2]', explanation: 'Single 0 at the beginning.' }
    ],
    hints: [
      'You need to partition the array into three sections in a single pass without using a library sort.',
      'Use three pointers: low (next position for 0), mid (current being processed), high (next position for 2).',
      'If mid == 0: swap with low, advance low and mid. If mid == 2: swap with high, retreat high. If mid == 1: advance mid.'
    ],
    solution: 'def sortColors(nums):\n    lo, mid, hi = 0, 0, len(nums) - 1\n    while mid <= hi:\n        if nums[mid] == 0:\n            nums[lo], nums[mid] = nums[mid], nums[lo]\n            lo += 1\n            mid += 1\n        elif nums[mid] == 2:\n            nums[mid], nums[hi] = nums[hi], nums[mid]\n            hi -= 1\n        else:\n            mid += 1',
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft']
  },
  {
    id: 'sorting-003',
    title: 'Largest Number',
    topic: 'sorting',
    difficulty: 'Hard',
    description: 'Given a list of non-negative integers nums, arrange them to form the largest possible number and return it as a string. For example, [10,2] arranges to "210210" which is larger than "10210".',
    examples: [
      { input: 'nums=[3,30,34,5,9]', output: '"9534330"', explanation: '9 + 53 + 43 + 30 forms the largest number 9534330.' },
      { input: 'nums=[1]', output: '"1"', explanation: 'Single element.' }
    ],
    hints: [
      'The challenge is defining what "larger" means when comparing two numbers for ordering.',
      'Compare two numbers a and b by checking whether str(a) + str(b) is greater than str(b) + str(a).',
      'Use custom comparator. Sort descending by comparator(a,b): return 1 if a+b < b+a (swap). Handle all-zeros edge case.'
    ],
    solution: 'from functools import cmp_to_key\ndef largestNumber(nums):\n    def compare(a, b):\n        if a + b > b + a:\n            return -1\n        elif a + b < b + a:\n            return 1\n        return 0\n    nums = list(map(str, nums))\n    nums.sort(key=cmp_to_key(compare))\n    result = \"\".join(nums)\n    return result if result[0] != \"0\" else \"0\"',
    time_complexity: 'O(n log n)',
    space_complexity: 'O(n)',
    companies: ['Amazon', 'Google', 'Meta']
  },

  // ─── SEARCHING ────────────────────────────────────────────
  {
    id: 'searching-001',
    title: 'Binary Search',
    topic: 'searching',
    difficulty: 'Easy',
    description: 'Given a sorted array of distinct integers nums and a target, return the index of target if it exists, otherwise return -1. Use O(log n) time.',
    examples: [
      { input: 'nums=[-1,0,3,5,9,12], target=9', output: '4', explanation: '9 is at index 4.' },
      { input: 'nums=[-1,0,3,5,9,12], target=2', output: '-1', explanation: '2 does not exist in the array.' }
    ],
    hints: [
      'Because the array is sorted, you can eliminate half of it with each comparison.',
      'Maintain left and right pointers. Check the middle element each iteration.',
      'If mid == target: return mid. If mid < target: move left to mid+1. If mid > target: move right to mid-1.'
    ],
    solution: 'def search(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1',
    time_complexity: 'O(log n)',
    space_complexity: 'O(1)',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple']
  },
  {
    id: 'searching-002',
    title: 'Search in Rotated Sorted Array',
    topic: 'searching',
    difficulty: 'Medium',
    description: 'A sorted array was rotated at some unknown pivot. Given the rotated array (which was sorted and then rotated) and a target, return the index of target or -1 if it does not exist. Must use O(log n).',
    examples: [
      { input: 'nums=[4,5,6,7,0,1,2], target=0', output: '4', explanation: '0 is at index 4.' },
      { input: 'nums=[4,5,6,7,0,1,2], target=3', output: '-1', explanation: '3 does not exist.' }
    ],
    hints: [
      'Even after rotation, one half of the array (from mid to end) is always sorted.',
      'At each step, determine which half is sorted, then check if target is in that sorted range.',
      'If nums[lo] <= nums[mid]: left half is sorted. Check if target in [nums[lo], nums[mid]]. Update pointers accordingly.'
    ],
    solution: 'def search(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[lo] <= nums[mid]:\n            if nums[lo] <= target < nums[mid]:\n                hi = mid - 1\n            else:\n                lo = mid + 1\n        else:\n            if nums[mid] < target <= nums[hi]:\n                lo = mid + 1\n            else:\n                hi = mid - 1\n    return -1',
    time_complexity: 'O(log n)',
    space_complexity: 'O(1)',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft']
  },
  {
    id: 'searching-003',
    title: 'Find Minimum in Rotated Sorted Array II',
    topic: 'searching',
    difficulty: 'Hard',
    description: 'Given a rotated sorted array that may contain duplicates, find the minimum element. The array was originally sorted and then rotated at some pivot, possibly multiple times.',
    examples: [
      { input: 'nums=[1,3,5]', output: '1', explanation: 'No rotation, minimum is at index 0.' },
      { input: 'nums=[2,2,2,0,1]', output: '0', explanation: 'Minimum is 0.' }
    ],
    hints: [
      'This is like the previous problem but with duplicates, which breaks the normal binary search logic.',
      'When nums[left] == nums[mid] == nums[right], you cannot determine which side is sorted. Shrink the window.',
      'Use binary search: if mid < high, minimum is in left half. If mid > high, in right half. If equal, reduce high.'
    ],
    solution: 'def findMin(nums):\n    lo, hi = 0, len(nums) - 1\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if nums[mid] > nums[hi]:\n            lo = mid + 1\n        elif nums[mid] < nums[hi]:\n            hi = mid\n        else:\n            hi -= 1\n    return nums[lo]',
    time_complexity: 'O(log n)',
    space_complexity: 'O(1)',
    companies: ['Google', 'Amazon', 'Microsoft']
  },

  // ─── STRINGS ──────────────────────────────────────────────
  {
    id: 'strings-001',
    title: 'Valid Palindrome',
    topic: 'strings',
    difficulty: 'Easy',
    description: 'Given a string s, determine if it is a palindrome after converting all uppercase letters to lowercase and removing all non-alphanumeric characters. Consider only alphanumeric characters.',
    examples: [
      { input: 's="A man, a plan, a canal: Panama"', output: 'true', explanation: 'After cleaning: "amanaplanacanalpanama" which is a palindrome.' },
      { input: 's="race a car"', output: 'false', explanation: 'After cleaning: "raceacar" is not a palindrome.' }
    ],
    hints: [
      'First, strip the string: keep only alphanumeric characters and convert to lowercase.',
      'Then verify by comparing characters from the left with their mirror on the right.',
      'Or use two pointers: left at start, right at end. Skip non-alphanumeric, compare characters after normalizing to lowercase.'
    ],
    solution: 'def isPalindrome(s):\n    cleaned = \"\".join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]',
    time_complexity: 'O(n)',
    space_complexity: 'O(n)',
    companies: ['Meta', 'Amazon', 'Google', 'Microsoft']
  },
  {
    id: 'strings-002',
    title: 'Longest Substring Without Repeating Characters',
    topic: 'strings',
    difficulty: 'Medium',
    description: 'Given a string s, find the length of the longest substring without repeating characters. A substring is a contiguous sequence of characters.',
    examples: [
      { input: 's="abcabcbb"', output: '3', explanation: 'The longest substring without duplicates is "abc" with length 3.' },
      { input: 's="bbbbb"', output: '1', explanation: 'Only "b" can appear once.' }
    ],
    hints: [
      'Use a sliding window that expands on the right and shrinks on the left when you encounter a duplicate.',
      'Maintain a dictionary mapping each character to its most recent index.',
      'When a character is already in the window, move the left pointer past its previous occurrence. Track max length.'
    ],
    solution: 'def lengthOfLongestSubstring(s):\n    seen = {}\n    lo = max_len = 0\n    for hi, c in enumerate(s):\n        if c in seen and seen[c] >= lo:\n            lo = seen[c] + 1\n        seen[c] = hi\n        max_len = max(max_len, hi - lo + 1)\n    return max_len',
    time_complexity: 'O(n)',
    space_complexity: 'O(min(n, alphabet))',
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft', 'Apple']
  },
  {
    id: 'strings-003',
    title: 'Minimum Window Substring',
    topic: 'strings',
    difficulty: 'Hard',
    description: 'Given two strings s and t, find the minimum window substring of s that contains all characters from t (including duplicates). The minimum window is the smallest window in s that has all of t\'s characters. Return "" if no window exists.',
    examples: [
      { input: 's="ADOBECODEBANC", t="ABC"', output: '"BANC"', explanation: 'Window "BANC" contains A, B, C from t.' },
      { input: 's="a", t="aa"', output: '""', explanation: 'No window contains two a\'s.' }
    ],
    hints: [
      'Use a sliding window. Expand right until all characters of t are covered, then shrink from the left.',
      'Maintain two frequency maps: one for the characters needed (t), one for the current window (s).',
      'When the window satisfies all requirements, try shrinking. Record the smallest window that worked.'
    ],
    solution: 'from collections import Counter\ndef minWindow(s, t):\n    need = Counter(t)\n    missing = len(t)\n    lo = 0\n    result = \"\"\n    for hi, c in enumerate(s):\n        if need[c] > 0:\n            missing -= 1\n        need[c] -= 1\n        if missing == 0:\n            while need[s[lo]] < 0:\n                need[s[lo]] += 1\n                lo += 1\n            if not result or hi - lo + 1 < len(result):\n                result = s[lo:hi+1]\n            need[s[lo]] += 1\n            missing += 1\n            lo += 1\n    return result',
    time_complexity: 'O(|s| + |t|)',
    space_complexity: 'O(|t|)',
    companies: ['Meta', 'Google', 'Amazon', 'Microsoft']
  },

  // ─── HEAPS ────────────────────────────────────────────────
  {
    id: 'heaps-001',
    title: 'Last Stone Weight',
    topic: 'heaps',
    difficulty: 'Easy',
    description: 'Given an array of stone weights, repeatedly smash the two heaviest stones together. If they are equal, both are destroyed. If not, the difference becomes a new stone. Return the weight of the last remaining stone (0 if no stones left).',
    examples: [
      { input: 'stones=[2,7,4,1,8,1]', output: '1', explanation: 'Smash 7 and 2: new stone 5. Then 5 and 8: new stone 3. Then 4 and 3: new stone 1.' },
      { input: 'stones=[1]', output: '1', explanation: 'Only one stone.' }
    ],
    hints: [
      'At each step, you need to find and remove the two largest stones quickly.',
      'A max-heap is ideal, but Python has only min-heap. Use a min-heap with negated values.',
      'Push all stones (negated) into heap. While more than 1 stone: pop two largest, calculate difference, push back if non-zero.'
    ],
    solution: 'import heapq\ndef lastStoneWeight(stones):\n    heap = [-s for s in stones]\n    heapq.heapify(heap)\n    while len(heap) > 1:\n        y = -heapq.heappop(heap)\n        x = -heapq.heappop(heap)\n        if y > x:\n            heapq.heappush(heap, -(y - x))\n    return -heap[0] if heap else 0',
    time_complexity: 'O(n log n)',
    space_complexity: 'O(n)',
    companies: ['Amazon', 'Google']
  },
  {
    id: 'heaps-002',
    title: 'K Closest Points to Origin',
    topic: 'heaps',
    difficulty: 'Medium',
    description: 'Given an array of points where points[i] = [x_i, y_i] and an integer k, return the k points closest to the origin (0, 0). Distance is calculated as sqrt(x² + y²). Return them in any order.',
    examples: [
      { input: 'points=[[1,3],[-2,2]], k=1', output: '[[-2,2]]', explanation: 'Distance of (1,3) is sqrt(10), (-2,2) is sqrt(8). Closer is (-2,2).' },
      { input: 'points=[[3,0],[2,4],[5,0]], k=2', output: '[[2,4],[3,0]] or [[3,0],[2,4]]', explanation: 'Distances: sqrt(9), sqrt(20), sqrt(25). Closest 2.' }
    ],
    hints: [
      'You need to find k points with smallest distance. Consider using a heap of size k.',
      'A max-heap of size k keeps the k smallest elements seen so far. Pop if heap exceeds k.',
      'Push each point with its negative distance (for max-heap in Python) or use nlargest(k, points, key=...).'
    ],
    solution: 'import heapq\ndef kClosest(points, k):\n    def dist(point):\n        return point[0]**2 + point[1]**2\n    heap = []\n    for p in points:\n        heapq.heappush(heap, (-dist(p), p))\n        if len(heap) > k:\n            heapq.heappop(heap)\n    return [p for _, p in heap]',
    time_complexity: 'O(n log k)',
    space_complexity: 'O(k)',
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft']
  },
  {
    id: 'heaps-003',
    title: 'Find Median from Data Stream',
    topic: 'heaps',
    difficulty: 'Hard',
    description: 'Design a data structure that supports adding an integer number and finding the median of all numbers added so far. Implement addNum(int num) and findMedian() methods.',
    examples: [
      { input: 'addNum(1), addNum(2), findMedian() → 1.5, addNum(3), findMedian() → 2.0', output: '' },
      { input: 'addNum(12), findMedian() → 12.0', output: '' }
    ],
    hints: [
      'Split numbers into two halves: the smaller half (max-heap) and the larger half (min-heap).',
      'The median is either the average of the two middle numbers (even count) or the middle number (odd count).',
      'addNum: push to max-heap, then balance by moving the largest of the lower half to the min-heap. Keep sizes balanced.'
    ],
    solution: 'import heapq\nclass MedianFinder:\n    def __init__(self):\n        self.lo = []\n        self.hi = []\n    def addNum(self, num):\n        heapq.heappush(self.lo, -num)\n        heapq.heappush(self.hi, -heapq.heappop(self.lo))\n        if len(self.hi) > len(self.lo):\n            heapq.heappush(self.lo, -heapq.heappop(self.hi))\n    def findMedian(self):\n        if len(self.lo) > len(self.hi):\n            return -self.lo[0]\n        return (-self.lo[0] + self.hi[0]) / 2',
    time_complexity: 'O(log n) add, O(1) median',
    space_complexity: 'O(n)',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft']
  },

  // ─── LINKED LISTS ─────────────────────────────────────────
  {
    id: 'linked_lists-001',
    title: 'Reverse Linked List',
    topic: 'linked_lists',
    difficulty: 'Easy',
    description: 'Given the head of a singly linked list, reverse the list in-place and return the new head. Each node has a val and next pointer.',
    examples: [
      { input: 'head=[1,2,3,4,5]', output: '[5,4,3,2,1]', explanation: 'Reversed list.' },
      { input: 'head=[1,2]', output: '[2,1]', explanation: 'Two elements reversed.' }
    ],
    hints: [
      'You need to reverse the direction of each pointer without losing the rest of the list.',
      'Use three pointers: prev (previous node), curr (current node), next (save the rest). Update pointers in a loop.',
      'Initialize prev=None, curr=head. While curr: next=curr.next; curr.next=prev; prev=curr; curr=next. Return prev.'
    ],
    solution: 'def reverseList(head):\n    prev = None\n    curr = head\n    while curr:\n        next_node = curr.next\n        curr.next = prev\n        prev = curr\n        curr = next_node\n    return prev',
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft', 'Apple']
  },
  {
    id: 'linked_lists-002',
    title: 'Detect Cycle in Linked List',
    topic: 'linked_lists',
    difficulty: 'Medium',
    description: 'Given the head of a singly linked list, determine if there is a cycle in the list. A cycle exists if some node can be reached again by following next pointers. Use O(1) extra space (no hash set).',
    examples: [
      { input: 'head=[3,2,0,-4], pos=1', output: 'true', explanation: 'Tail connects to second node, creating a cycle.' },
      { input: 'head=[1,2], pos=-1', output: 'false', explanation: 'No cycle exists.' }
    ],
    hints: [
      'Imagine two runners on a circular track: one slow, one fast. They will meet if there is a cycle.',
      'Use Floyd\'s Tortoise and Hare algorithm: slow moves 1 step, fast moves 2 steps.',
      'If fast or fast.next becomes None, no cycle. If slow ever equals fast, a cycle exists.'
    ],
    solution: 'def hasCycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow == fast:\n            return True\n    return False',
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft']
  },
  {
    id: 'linked_lists-003',
    title: 'Merge K Sorted Lists',
    topic: 'linked_lists',
    difficulty: 'Hard',
    description: 'Given an array of k sorted linked lists, merge them into one sorted linked list and return the new head. Each list is sorted in ascending order.',
    examples: [
      { input: 'lists=[[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]', explanation: 'All lists merged into one sorted list.' },
      { input: 'lists=[]', output: 'null', explanation: 'Empty input.' }
    ],
    hints: [
      'You need to repeatedly pick the smallest current element among k lists.',
      'A min-heap efficiently finds the smallest element. Push the head of each non-empty list.',
      'Push node to heap, then push its next node. Pop smallest, add to result, continue until heap empty.'
    ],
    solution: 'import heapq\ndef mergeKLists(lists):\n    heap = []\n    for i, lst in enumerate(lists):\n        if lst:\n            heapq.heappush(heap, (lst.val, i, lst))\n    dummy = cur = ListNode(0)\n    while heap:\n        val, i, node = heapq.heappop(heap)\n        cur.next = node\n        cur = cur.next\n        if node.next:\n            heapq.heappush(heap, (node.next.val, i, node.next))\n    return dummy.next',
    time_complexity: 'O(N log k)',
    space_complexity: 'O(k)',
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft']
  },

];

async function seed() {
  console.log(`Seeding ${problems.length} problems...`);
  const { error } = await supabase.from('problems_bank').upsert(problems, { onConflict: 'id' });
  if (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
  console.log(`Successfully seeded ${problems.length} problems.`);
}

seed();