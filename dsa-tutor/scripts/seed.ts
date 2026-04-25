// scripts/seed.ts
// Run with: npx ts-node --esm scripts/seed.ts
// Or import directly in Supabase SQL Editor as JSON

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PROBLEMS = [
  // ARRAYS - Easy
  {
    id: 'arrays-001',
    title: 'Two Sum',
    topic: 'arrays',
    difficulty: 'Easy',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' }
    ],
    hints: ['Try using a hash map to store complements.', 'For each number, check if target - number exists in the map.'],
    solution: 'def twoSum(nums, target):\n  seen = {}\n  for i, num in enumerate(nums):\n    complement = target - num\n    if complement in seen:\n      return [seen[complement], i]\n    seen[num] = i\n  return []',
    time_complexity: 'O(n)',
    space_complexity: 'O(n)',
    companies: ['Google', 'Amazon', 'Apple', 'Microsoft']
  },
  {
    id: 'arrays-002',
    title: 'Maximum Subarray',
    topic: 'arrays',
    difficulty: 'Medium',
    description: 'Given an integer array nums, find the subarray with the largest sum and return its sum.',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' }
    ],
    hints: ['Think of Kadanes algorithm.', 'Track current sum and maximum sum simultaneously.'],
    solution: 'def maxSubArray(nums):\n  max_sum = nums[0]\n  current = nums[0]\n  for i in range(1, len(nums)):\n    current = max(nums[i], current + nums[i])\n    max_sum = max(max_sum, current)\n  return max_sum',
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    companies: ['Amazon', 'Microsoft', 'Apple']
  },
  {
    id: 'arrays-003',
    title: 'Product of Array Except Self',
    topic: 'arrays',
    difficulty: 'Medium',
    description: 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. Solve without using division.',
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' },
      { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]' }
    ],
    hints: ['Use prefix and suffix products.', 'For each position, product of all elements to the left times all elements to the right.'],
    solution: 'def productExceptSelf(nums):\n  n = len(nums)\n  result = [1] * n\n  prefix = 1\n  for i in range(n):\n    result[i] = prefix\n    prefix *= nums[i]\n  suffix = 1\n  for i in range(n-1, -1, -1):\n    result[i] *= suffix\n    suffix *= nums[i]\n  return result',
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    companies: ['Amazon', 'Microsoft', 'Apple', 'Google']
  },
  // ARRAYS - Hard
  {
    id: 'arrays-004',
    title: 'First Missing Positive',
    topic: 'arrays',
    difficulty: 'Hard',
    description: 'Given an unsorted integer array nums, find the smallest missing positive integer. You must implement an algorithm with O(n) time complexity and O(1) auxiliary space complexity.',
    examples: [
      { input: 'nums = [1,2,0]', output: '3' },
      { input: 'nums = [3,4,-1,1]', output: '2' },
      { input: 'nums = [7,8,9,11,12]', output: '1' }
    ],
    hints: ['Think about placing each number in its correct position.', 'The answer is always in range [1, n+1].'],
    solution: 'def firstMissingPositive(nums):\n  n = len(nums)\n  for i in range(n):\n    while 1 <= nums[i] <= n and nums[nums[i]-1] != nums[i]:\n      nums[nums[i]-1], nums[i] = nums[i], nums[nums[i]-1]\n  for i in range(n):\n    if nums[i] != i+1:\n      return i+1\n  return n+1',
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    companies: ['Amazon', 'Google', 'Microsoft']
  },

  // RECURSION - Easy
  {
    id: 'recursion-001',
    title: 'Fibonacci Number',
    topic: 'recursion',
    difficulty: 'Easy',
    description: 'Given n, calculate F(n) where F(n) is defined as: F(n) = F(n-1) + F(n-2) with F(0) = 0 and F(1) = 1. Return the nth Fibonacci number.',
    examples: [
      { input: 'n = 2', output: '1' },
      { input: 'n = 3', output: '2' },
      { input: 'n = 4', output: '3' }
    ],
    hints: ['Base case: when n is 0 or 1.', 'Recursive case: return fib(n-1) + fib(n-2).'],
    solution: 'def fib(n):\n  if n <= 1:\n    return n\n  return fib(n-1) + fib(n-2)',
    time_complexity: 'O(2^n)',
    space_complexity: 'O(n)',
    companies: ['Amazon', 'Apple', 'Microsoft']
  },
  {
    id: 'recursion-002',
    title: 'Reverse String',
    topic: 'recursion',
    difficulty: 'Easy',
    description: 'Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.',
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' }
    ],
    hints: ['Use two pointers.', 'Swap characters from both ends moving inward.'],
    solution: 'def reverseString(s):\n  def helper(l, r):\n    if l >= r:\n      return\n    s[l], s[r] = s[r], s[l]\n    helper(l+1, r-1)\n  helper(0, len(s)-1)',
    time_complexity: 'O(n)',
    space_complexity: 'O(n)',
    companies: ['Microsoft', 'Amazon']
  },

  // RECURSION - Medium
  {
    id: 'recursion-003',
    title: 'Permutations',
    topic: 'recursion',
    difficulty: 'Medium',
    description: 'Given an array nums of distinct integers, return all possible permutations. You can return the answer in any order.',
    examples: [
      { input: 'nums = [1,2,3]', output: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]' }
    ],
    hints: ['Use backtracking.', 'At each position, try each remaining element.'],
    solution: 'def permute(nums):\n  result = []\n  used = [False] * len(nums)\n  def backtrack(path):\n    if len(path) == len(nums):\n      result.append(path[:])\n      return\n    for i in range(len(nums)):\n      if not used[i]:\n        used[i] = True\n        path.append(nums[i])\n        backtrack(path)\n        path.pop()\n        used[i] = False\n  backtrack([])\n  return result',
    time_complexity: 'O(n! * n)',
    space_complexity: 'O(n)',
    companies: ['Amazon', 'Google', 'Apple']
  },
  {
    id: 'recursion-004',
    title: 'Subsets',
    topic: 'recursion',
    difficulty: 'Medium',
    description: 'Given an integer array nums of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets. Return the solution in any order.',
    examples: [
      { input: 'nums = [1,2,3]', output: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]' },
      { input: 'nums = [0]', output: '[[],[0]]' }
    ],
    hints: ['At each element, decide to include or exclude it.', 'Build subsets iteratively.'],
    solution: 'def subsets(nums):\n  result = [[]]\n  for num in nums:\n    result += [curr + [num] for curr in result]\n  return result',
    time_complexity: 'O(n * 2^n)',
    space_complexity: 'O(n)',
    companies: ['Amazon', 'Google', 'Microsoft']
  },

  // SORTING - Easy
  {
    id: 'sorting-001',
    title: 'Merge Sorted Arrays',
    topic: 'sorting',
    difficulty: 'Easy',
    description: 'You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n representing the number of elements in nums1 and nums2 respectively. Merge nums1 and nums2 into a single array sorted in non-decreasing order.',
    examples: [
      { input: 'nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3', output: '[1,2,2,3,5,6]' }
    ],
    hints: ['Use three pointers working backwards.', 'Compare from the end of both arrays.'],
    solution: 'def merge(nums1, m, nums2, n):\n  p1, p2 = m-1, n-1\n  p = m + n - 1\n  while p1 >= 0 and p2 >= 0:\n    if nums1[p1] > nums2[p2]:\n      nums1[p] = nums1[p1]\n      p1 -= 1\n    else:\n      nums1[p] = nums2[p2]\n      p2 -= 1\n    p -= 1\n  while p2 >= 0:\n    nums1[p] = nums2[p2]\n    p2, p = p2-1, p-1',
    time_complexity: 'O(m+n)',
    space_complexity: 'O(1)',
    companies: ['Amazon', 'Microsoft', 'Apple']
  },
  {
    id: 'sorting-002',
    title: 'Insert Interval',
    topic: 'sorting',
    difficulty: 'Medium',
    description: 'You are given an array of non-overlapping intervals sorted by start time. Add a new interval and return the resulting array of non-overlapping intervals sorted by start time.',
    examples: [
      { input: 'intervals = [[1,3],[6,9]], newInterval = [2,5]', output: '[[1,5],[6,9]]' },
      { input: 'intervals = [[1,2],[3,4],[5,7]], newInterval = [6,8]', output: '[[1,2],[3,4],[5,8]]' }
    ],
    hints: ['分成三部分：before, overlap, after.', '合并所有重叠的区间。'],
    solution: 'def insert(intervals, newInterval):\n  result = []\n  i = 0\n  while i < len(intervals) and intervals[i][1] < newInterval[0]:\n    result.append(intervals[i])\n    i += 1\n  while i < len(intervals) and intervals[i][0] <= newInterval[1]:\n    newInterval = [min(newInterval[0], intervals[i][0]), max(newInterval[1], intervals[i][1])]\n    i += 1\n  result.append(newInterval)\n  while i < len(intervals):\n    result.append(intervals[i])\n    i += 1\n  return result',
    time_complexity: 'O(n)',
    space_complexity: 'O(n)',
    companies: ['Google', 'Amazon', 'Facebook']
  },

  // SEARCHING - Easy
  {
    id: 'searching-001',
    title: 'Binary Search',
    topic: 'searching',
    difficulty: 'Easy',
    description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1. You must write an algorithm with O(log n) runtime complexity.',
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists in nums and its index is 4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explanation: '2 does not exist in nums so return -1' }
    ],
    hints: ['Use two pointers: left and right.', 'Reduce search space by half each iteration.'],
    solution: 'def search(nums, target):\n  left, right = 0, len(nums) - 1\n  while left <= right:\n    mid = (left + right) // 2\n    if nums[mid] == target:\n      return mid\n    elif nums[mid] < target:\n      left = mid + 1\n    else:\n      right = mid - 1\n  return -1',
    time_complexity: 'O(log n)',
    space_complexity: 'O(1)',
    companies: ['Amazon', 'Microsoft', 'Apple', 'Google']
  },
  {
    id: 'searching-002',
    title: 'Search in Rotated Array',
    topic: 'searching',
    difficulty: 'Medium',
    description: 'There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, the array might be rotated. Given a target value, return its index if it is in nums, otherwise return -1. Solve in O(log n) time.',
    examples: [
      { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4' },
      { input: 'nums = [4,5,6,7,0,1,2], target = 3', output: '-1' }
    ],
    hints: ['Find which half is sorted.', 'Check if target is in the sorted half.'],
    solution: 'def search(nums, target):\n  left, right = 0, len(nums) - 1\n  while left <= right:\n    mid = (left + right) // 2\n    if nums[mid] == target:\n      return mid\n    if nums[left] <= nums[mid]:\n      if nums[left] <= target < nums[mid]:\n        right = mid - 1\n      else:\n        left = mid + 1\n    else:\n      if nums[mid] < target <= nums[right]:\n        left = mid + 1\n      else:\n        right = mid - 1\n  return -1',
    time_complexity: 'O(log n)',
    space_complexity: 'O(1)',
    companies: ['Amazon', 'Microsoft', 'Apple']
  },

  // STRINGS - Easy
  {
    id: 'strings-001',
    title: 'Valid Palindrome',
    topic: 'strings',
    difficulty: 'Easy',
    description: 'Given a string s, return true if it is a palindrome, or false otherwise. A palindrome is a word, phrase, or sequence that reads the same backward as forward. Alphanumeric characters include letters and numbers.',
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: '"amanaplanacanalpanama" is a palindrome.' },
      { input: 's = "race a car"', output: 'false', explanation: '"raceacar" is not a palindrome.' }
    ],
    hints: ['Use two pointers from both ends.', 'Skip non-alphanumeric characters.'],
    solution: 'def isPalindrome(s):\n  left, right = 0, len(s) - 1\n  while left < right:\n    while left < right and not s[left].isalnum():\n      left += 1\n    while left < right and not s[right].isalnum():\n      right -= 1\n    if s[left].lower() != s[right].lower():\n      return False\n    left, right = left + 1, right - 1\n  return True',
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    companies: ['Facebook', 'Microsoft', 'Amazon']
  },
  {
    id: 'strings-002',
    title: 'Longest Substring Without Repeating Characters',
    topic: 'strings',
    difficulty: 'Medium',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with length 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with length 1.' }
    ],
    hints: ['Use sliding window.', 'Track character positions in a map.'],
    solution: 'def lengthOfLongestSubstring(s):\n  charIndex = {}\n  max_len = start = 0\n  for i, ch in enumerate(s):\n    if ch in charIndex and charIndex[ch] >= start:\n      start = charIndex[ch] + 1\n    charIndex[ch] = i\n    max_len = max(max_len, i - start + 1)\n  return max_len',
    time_complexity: 'O(n)',
    space_complexity: 'O(min(m))',
    companies: ['Amazon', 'Google', 'Facebook']
  },

  // LINKED LISTS - Easy
  {
    id: 'linked_lists-001',
    title: 'Reverse Linked List',
    topic: 'linked_lists',
    difficulty: 'Easy',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' }
    ],
    hints: ['Use three pointers: prev, current, next.', 'Reverse each link one by one.'],
    solution: 'def reverseList(head):\n  prev = None\n  current = head\n  while current:\n    next = current.next\n    current.next = prev\n    prev = current\n    current = next\n  return prev',
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    companies: ['Amazon', 'Microsoft', 'Apple']
  },
  {
    id: 'linked_lists-002',
    title: 'Merge Two Sorted Lists',
    topic: 'linked_lists',
    difficulty: 'Easy',
    description: 'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.',
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' }
    ],
    hints: ['Compare nodes from both lists.', 'Pick the smaller node each time.'],
    solution: 'def mergeTwoLists(list1, list2):\n  dummy = ListNode(0)\n  current = dummy\n  while list1 and list2:\n    if list1.val <= list2.val:\n      current.next = list1\n      list1 = list1.next\n    else:\n      current.next = list2\n      list2 = list2.next\n    current = current.next\n  current.next = list1 or list2\n  return dummy.next',
    time_complexity: 'O(n+m)',
    space_complexity: 'O(1)',
    companies: ['Amazon', 'Apple', 'Microsoft']
  },
  {
    id: 'linked_lists-003',
    title: 'Linked List Cycle',
    topic: 'linked_lists',
    difficulty: 'Medium',
    description: 'Given head of a linked list, determine if the linked list has a cycle in it. Return true if there is a cycle in the linked list. Otherwise, return false.',
    examples: [
      { input: 'head = [3,2,0,-4], pos = 1', output: 'true' },
      { input: 'head = [1,2], pos = 0', output: 'true' },
      { input: 'head = [1], pos = -1', output: 'false' }
    ],
    hints: ['Use Floyd Tortoise and Hare algorithm.', 'Two pointers: slow moves 1 step, fast moves 2 steps.'],
    solution: 'def hasCycle(head):\n  slow = fast = head\n  while fast and fast.next:\n    slow = slow.next\n    fast = fast.next.next\n    if slow == fast:\n      return True\n  return False',
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    companies: ['Amazon', 'Microsoft', 'Uber']
  },

  // TREES - Easy
  {
    id: 'trees-001',
    title: 'Maximum Depth of Binary Tree',
    topic: 'trees',
    difficulty: 'Easy',
    description: 'Given the root of a binary tree, return its maximum depth. A binary trees maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '3' },
      { input: 'root = [1,null,2]', output: '2' }
    ],
    hints: ['Use recursion or BFS.', 'Depth = max(left_depth, right_depth) + 1.'],
    solution: 'def maxDepth(root):\n  if not root:\n    return 0\n  return 1 + max(maxDepth(root.left), maxDepth(root.right))',
    time_complexity: 'O(n)',
    space_complexity: 'O(h)',
    companies: ['Amazon', 'Apple', 'Microsoft']
  },
  {
    id: 'trees-002',
    title: 'Invert Binary Tree',
    topic: 'trees',
    difficulty: 'Easy',
    description: 'Given the root of a binary tree, invert the tree and return its root. Inverting means swapping the left and right children of every node.',
    examples: [
      { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' },
      { input: 'root = [2,1,3]', output: '[2,3,1]' }
    ],
    hints: ['Use recursion.', 'Swap children, then invert each subtree.'],
    solution: 'def invertTree(root):\n  if not root:\n    return None\n  root.left, root.right = root.right, root.left\n  invertTree(root.left)\n  invertTree(root.right)\n  return root',
    time_complexity: 'O(n)',
    space_complexity: 'O(h)',
    companies: ['Google', 'Amazon', 'Apple']
  },
  {
    id: 'trees-003',
    title: 'Validate Binary Search Tree',
    topic: 'trees',
    difficulty: 'Medium',
    description: 'Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST has all nodes in left subtree less than current node, and all nodes in right subtree greater.',
    examples: [
      { input: 'root = [2,1,3]', output: 'true' },
      { input: 'root = [5,1,4,null,null,3,6]', output: 'false' }
    ],
    hints: ['Use valid range for each node.', 'Track min/max bounds while recursing.'],
    solution: 'def isValidBST(root):\n  def validate(node, min_val, max_val):\n    if not node:\n      return True\n    if node.val <= min_val or node.val >= max_val:\n      return False\n    return validate(node.left, min_val, node.val) and validate(node.right, node.val, max_val)\n  return validate(root, float(-inf), float(inf))',
    time_complexity: 'O(n)',
    space_complexity: 'O(h)',
    companies: ['Amazon', 'Google', 'Facebook']
  },
  {
    id: 'trees-004',
    title: 'Lowest Common Ancestor',
    topic: 'trees',
    difficulty: 'Medium',
    description: 'Given two nodes of a binary tree, find their lowest common ancestor. The lowest common ancestor is the lowest node that has both nodes as descendants.',
    examples: [
      { input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1', output: '3' },
      { input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4', output: '5' }
    ],
    hints: ['If nodes are in different subtrees, current node is LCA.', 'If both in left subtree, recurse left.'],
    solution: 'def lowestCommonAncestor(root, p, q):\n  if not root or root == p or root == q:\n    return root\n  left = lowestCommonAncestor(root.left, p, q)\n  right = lowestCommonAncestor(root.right, p, q)\n  if left and right:\n    return root\n  return left or right',
    time_complexity: 'O(n)',
    space_complexity: 'O(h)',
    companies: ['Amazon', 'Google', 'Apple', 'Facebook']
  },

  // GRAPHS - Easy
  {
    id: 'graphs-001',
    title: 'Number of Islands',
    topic: 'graphs',
    difficulty: 'Medium',
    description: 'Given a 2D grid of 1s (land) and 0s (water), count the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
    examples: [
      { input: 'grid = [["1","1","1"],["0","1","0"],["1","1","1"]]', output: '1' },
      { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: '3' }
    ],
    hints: ['Use DFS or BFS.', 'Mark visited cells to avoid counting twice.'],
    solution: 'def numIslands(grid):\n  if not grid:\n    return 0\n  count = 0\n  for i in range(len(grid)):\n    for j in range(len(grid[0])):\n      if grid[i][j] == "1":\n        count += 1\n        dfs(i, j, grid)\n  return count\n\ndef dfs(i, j, grid):\n  if i < 0 or j < 0 or i >= len(grid) or j >= len(grid[0]) or grid[i][j] != "1":\n    return\n  grid[i][j] = "0"\n  dfs(i+1, j, grid); dfs(i-1, j, grid)\n  dfs(i, j+1, grid); dfs(i, j-1, grid)',
    time_complexity: 'O(m*n)',
    space_complexity: 'O(m*n)',
    companies: ['Amazon', 'Microsoft', 'Google']
  },
  {
    id: 'graphs-002',
    title: 'Clone Graph',
    topic: 'graphs',
    difficulty: 'Medium',
    description: 'Given a reference of a node in a connected undirected graph, return a deep copy of the graph. Each node has a val and a list of neighbors.',
    examples: [
      { input: 'adjList = [[1,2],[0,2],[0,1]]', output: '[[1,2],[0,2],[0,1]]' }
    ],
    hints: ['Use BFS or DFS.', 'Map original nodes to cloned nodes.'],
    solution: 'def cloneGraph(node):\n  if not node:\n    return None\n  visited = {}\n  def clone(n):\n    if n in visited:\n      return visited[n]\n    copy = Node(n.val)\n    visited[n] = copy\n    for nei in n.neighbors:\n      copy.neighbors.append(clone(nei))\n    return copy\n  return clone(node)',
    time_complexity: 'O(V + E)',
    space_complexity: 'O(V)',
    companies: ['Google', 'Amazon']
  },

  // GRAPHS - Hard
  {
    id: 'graphs-003',
    title: 'Course Schedule',
    topic: 'graphs',
    difficulty: 'Hard',
    description: 'There are numCourses courses you have to take. Some courses may have prerequisites. Return true if you can finish all courses, otherwise false.',
    examples: [
      { input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true' },
      { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: 'false' }
    ],
    hints: ['This is a topological sort problem.', 'Detect cycles using DFS or Kahn algorithm.'],
    solution: 'def canFinish(numCourses, prerequisites):\n  graph = [[] for _ in range(numCourses)]\n  visit = [0] * numCourses\n  for v, k in prerequisites:\n    graph[k].append(v)\n  def dfs(i):\n    if visit[i] == 1:\n      return False\n    if visit[i] == 2:\n      return True\n    visit[i] = 1\n    for nei in graph[i]:\n      if not dfs(nei):\n        return False\n    visit[i] = 2\n    return True\n  for i in range(numCourses):\n    if not dfs(i):\n      return False\n  return True',
    time_complexity: 'O(V + E)',
    space_complexity: 'O(V + E)',
    companies: ['Amazon', 'Google', 'Meta']
  },

  // DP - Easy
  {
    id: 'dp-001',
    title: 'Climbing Stairs',
    topic: 'dp',
    difficulty: 'Easy',
    description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    examples: [
      { input: 'n = 2', output: '2', explanation: 'Two ways: (1+1) and (2)' },
      { input: 'n = 3', output: '3', explanation: 'Three ways: (1+1+1), (1+2), (2+1)' }
    ],
    hints: ['Ways(n) = Ways(n-1) + Ways(n-2).', 'This is Fibonacci.'],
    solution: 'def climbStairs(n):\n  if n <= 2:\n    return n\n  dp = [0] * (n + 1)\n  dp[1], dp[2] = 1, 2\n  for i in range(3, n + 1):\n    dp[i] = dp[i-1] + dp[i-2]\n  return dp[n]',
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    companies: ['Amazon', 'Apple', 'Microsoft']
  },
  {
    id: 'dp-002',
    title: 'House Robber',
    topic: 'dp',
    difficulty: 'Medium',
    description: 'You are a professional robber planning to rob houses along a street. Each house has a certain amount of money. Cannot rob two adjacent houses. What is the maximum amount you can rob?',
    examples: [
      { input: 'nums = [1,2,3,1]', output: '4', explanation: 'Rob house 1 (1) and house 3 (3), total 4.' },
      { input: 'nums = [2,7,9,3,1]', output: '12', explanation: 'Rob house 1 (2), house 2 (7), house 4 (3) = 12.' }
    ],
    hints: ['DP[i] = max(DP[i-1], DP[i-2] + nums[i]).', 'Track previous two values.'],
    solution: 'def rob(nums):\n  if not nums:\n    return 0\n  if len(nums) <= 2:\n    return max(nums)\n  prev2 = nums[0]\n  prev1 = max(nums[0], nums[1])\n  for i in range(2, len(nums)):\n    current = max(prev1, prev2 + nums[i])\n    prev2 = prev1\n    prev1 = current\n  return prev1',
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    companies: ['Amazon', 'Google', 'Apple']
  },
  {
    id: 'dp-003',
    title: 'Coin Change',
    topic: 'dp',
    difficulty: 'Medium',
    description: 'Given an array of coin denominations and a target amount, return the fewest number of coins needed to make up that amount. Return -1 if impossible.',
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1' },
      { input: 'coins = [2], amount = 3', output: '-1' }
    ],
    hints: ['Use bottom-up DP.', 'DP[i] = min(DP[i], DP[i-coin] + 1).'],
    solution: 'def coinChange(coins, amount):\n  dp = [float(\"inf\")] * (amount + 1)\n  dp[0] = 0\n  for i in range(1, amount + 1):\n    for coin in coins:\n      if coin <= i:\n        dp[i] = min(dp[i], dp[i - coin] + 1)\n  return dp[amount] if dp[amount] != float("inf") else -1',
    time_complexity: 'O(amount * len(coins))',
    space_complexity: 'O(amount)',
    companies: ['Amazon', 'Google', 'Apple']
  },
  {
    id: 'dp-004',
    title: 'Longest Increasing Subsequence',
    topic: 'dp',
    difficulty: 'Medium',
    description: 'Given an integer array nums, return the length of the longest strictly increasing subsequence.',
    examples: [
      { input: 'nums = [10,9,2,5,3,7,101,18]', output: '4', explanation: '[2,3,7,101] or [2,3,7,18]' },
      { input: 'nums = [0,1,0,3,2,3]', output: '4' }
    ],
    hints: ['Use binary search for O(n log n).', 'Or DP in O(n^2).'],
    solution: 'def lengthOfLIS(nums):\n  if not nums:\n    return 0\n  dp = [1] * len(nums)\n  for i in range(1, len(nums)):\n    for j in range(i):\n      if nums[j] < nums[i]:\n        dp[i] = max(dp[i], dp[j] + 1)\n  return max(dp)',
    time_complexity: 'O(n^2)',
    space_complexity: 'O(n)',
    companies: ['Amazon', 'Google', 'Apple']
  },

  // HEAPS - Easy
  {
    id: 'heaps-001',
    title: 'Kth Largest Element',
    topic: 'heaps',
    difficulty: 'Easy',
    description: 'Given an integer array nums and an integer k, return the kth largest element in the array. Note that it is the kth largest element in sorted order, not the kth distinct element.',
    examples: [
      { input: 'nums = [3,2,1,5,6,4], k = 2', output: '5' },
      { input: 'nums = [3,2,3,1,2,4,2,3,3,3], k = 4', output: '3' }
    ],
    hints: ['Use a min-heap of size k.', 'Or use quickselect.'],
    solution: 'import heapq\ndef findKthLargest(nums, k):\n  return sorted(nums)[-k]',
    time_complexity: 'O(n log n)',
    space_complexity: 'O(1)',
    companies: ['Amazon', 'Facebook', 'Apple']
  },
  {
    id: 'heaps-002',
    title: 'Top K Frequent Elements',
    topic: 'heaps',
    difficulty: 'Medium',
    description: 'Given an integer array nums and an integer k, return the k most frequent elements.',
    examples: [
      { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]' },
      { input: 'nums = [1], k = 1', output: '[1]' }
    ],
    hints: ['Count frequencies first.', 'Use a min-heap of size k.'],
    solution: 'import heapq\nfrom collections import Counter\ndef topKFrequent(nums, k):\n  freq = Counter(nums)\n  return [item for item, count in freq.most_common(k)]',
    time_complexity: 'O(n log k)',
    space_complexity: 'O(n)',
    companies: ['Amazon', 'Facebook', 'Apple']
  },
  {
    id: 'heaps-003',
    title: 'Merge K Sorted Lists',
    topic: 'heaps',
    difficulty: 'Hard',
    description: 'Merge k sorted linked lists and return it as one sorted list. Analyze and describe its complexity.',
    examples: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' }
    ],
    hints: ['Use a min-heap.', 'Push first element from each list.'],
    solution: 'import heapq\ndef mergeKLists(lists):\n  heap = []\n  for i, lst in enumerate(lists):\n    if lst:\n      heapq.heappush(heap, (lst.val, i, lst))\n  dummy = Node(0)\n  cur = dummy\n  while heap:\n    val, i, node = heapq.heappop(heap)\n    cur.next = node\n    cur = cur.next\n    if node.next:\n      heapq.heappush(heap, (node.next.val, i, node.next))\n  return dummy.next',
    time_complexity: 'O(N log k)',
    space_complexity: 'O(k)',
    companies: ['Amazon', 'Google', 'Facebook']
  },
];

async function seed() {
  console.log('Seeding problems_bank table...');
  
  for (const problem of PROBLEMS) {
    const { error } = await supabase
      .from('problems_bank')
      .upsert({ id: problem.id }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error(`Error inserting ${problem.id}:`, error.message);
    } else {
      console.log(`✓ Inserted: ${problem.id} - ${problem.title}`);
    }
  }

  console.log('\nDone!');
}

seed().catch(console.error);