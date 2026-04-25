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
    id: 'arrays-001', title: 'Two Sum', topic: 'arrays', difficulty: 'Easy',
    description: 'Given an array of integers nums and a target integer, return the indices of the two numbers that add up to target. Each input has exactly one solution. You may not use the same element twice.',
    examples: [{ input: 'nums=[2,7,11,15], target=9', output: '[0,1]', explanation: 'nums[0]+nums[1]=2+7=9' }],
    hints: [
      'Think about what number you need to find to pair with each element.',
      'A dictionary/hashmap lets you check in O(1) if a number exists. Store each number as you visit it.',
      'For each number x, check if (target - x) is already in your hashmap. If yes, return both indices.'
    ],
    solution: 'def twoSum(nums, target):\n    seen = {}\n    for i, x in enumerate(nums):\n        if target - x in seen:\n            return [seen[target - x], i]\n        seen[x] = i',
    time_complexity: 'O(n)', space_complexity: 'O(n)',
    companies: ['Google', 'Amazon', 'Meta']
  },
  {
    id: 'arrays-002', title: 'Best Time to Buy and Sell Stock', topic: 'arrays', difficulty: 'Medium',
    description: 'Given an array prices where prices[i] is the price of a stock on day i, return the maximum profit you can achieve from one transaction. If no profit is possible, return 0.',
    examples: [{ input: 'prices=[7,1,5,3,6,4]', output: '5', explanation: 'Buy at 1, sell at 6' }],
    hints: [
      'You need to find the best day to buy and the best day to sell after buying.',
      'Track the minimum price seen so far as you scan left to right.',
      'At each day, profit = current price - min price so far. Track the max of these profits.'
    ],
    solution: 'def maxProfit(prices):\n    min_p, max_p = float("inf"), 0\n    for p in prices:\n        min_p = min(min_p, p)\n        max_p = max(max_p, p - min_p)\n    return max_p',
    time_complexity: 'O(n)', space_complexity: 'O(1)',
    companies: ['Amazon', 'Bloomberg']
  },
  {
    id: 'arrays-003', title: 'Maximum Subarray (Kadane)', topic: 'arrays', difficulty: 'Hard',
    description: 'Given an integer array nums, find the contiguous subarray with the largest sum and return its sum.',
    examples: [{ input: 'nums=[-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] has sum 6' }],
    hints: [
      'Think about building the best subarray one element at a time from left to right.',
      "At each position, decide: extend the previous subarray or start fresh? Start fresh if the previous sum is negative.",
      'current = max(num, current + num). Track the global max across all positions. This is Kadane\'s algorithm.'
    ],
    solution: 'def maxSubArray(nums):\n    cur = best = nums[0]\n    for n in nums[1:]:\n        cur = max(n, cur + n)\n        best = max(best, cur)\n    return best',
    time_complexity: 'O(n)', space_complexity: 'O(1)',
    companies: ['Google', 'Microsoft', 'Apple']
  },

  // ─── TREES ────────────────────────────────────────────────
  {
    id: 'trees-001', title: 'Maximum Depth of Binary Tree', topic: 'trees', difficulty: 'Easy',
    description: 'Given the root of a binary tree, return its maximum depth — the number of nodes along the longest path from the root down to the farthest leaf node.',
    examples: [{ input: 'root=[3,9,20,null,null,15,7]', output: '3' }],
    hints: [
      'Think of the tree depth as: 1 (for this node) + the depth of the deeper child.',
      'Recursion fits perfectly here. The depth of a node is 1 + max(depth of left, depth of right).',
      'Base case: if node is None, return 0. Recursive case: return 1 + max(maxDepth(left), maxDepth(right)).'
    ],
    solution: 'def maxDepth(root):\n    if not root: return 0\n    return 1 + max(maxDepth(root.left), maxDepth(root.right))',
    time_complexity: 'O(n)', space_complexity: 'O(h)',
    companies: ['Amazon', 'Facebook']
  },
  {
    id: 'trees-002', title: 'Validate Binary Search Tree', topic: 'trees', difficulty: 'Medium',
    description: 'Given the root of a binary tree, determine if it is a valid BST. A valid BST has: left subtree nodes with values strictly less than the node, right subtree nodes with values strictly greater.',
    examples: [{ input: 'root=[2,1,3]', output: 'true' }],
    hints: [
      'Checking just left < root < right at each node is not enough — consider [5,1,4,null,null,3,6].',
      'Pass valid min and max bounds down the tree as you recurse. Every node must stay within its inherited range.',
      'validate(node, min=-inf, max=+inf). Left call: validate(left, min, node.val). Right call: validate(right, node.val, max).'
    ],
    solution: 'def isValidBST(root, lo=float("-inf"), hi=float("inf")):\n    if not root: return True\n    if not (lo < root.val < hi): return False\n    return isValidBST(root.left, lo, root.val) and isValidBST(root.right, root.val, hi)',
    time_complexity: 'O(n)', space_complexity: 'O(h)',
    companies: ['Amazon', 'Google', 'Microsoft']
  },
  {
    id: 'trees-003', title: 'Binary Tree Level Order Traversal', topic: 'trees', difficulty: 'Hard',
    description: 'Given the root of a binary tree, return the level order traversal of its nodes\' values (i.e., from left to right, level by level) as a list of lists.',
    examples: [{ input: 'root=[3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' }],
    hints: [
      'Level order means visiting all nodes at depth 1, then depth 2, and so on — like scanning row by row.',
      'A queue (BFS) is the right tool. Add the root, then process one full level at a time.',
      'At each level, record queue size N. Dequeue N nodes, add their values to current level, enqueue their children. Repeat.'
    ],
    solution: 'from collections import deque\ndef levelOrder(root):\n    if not root: return []\n    q, res = deque([root]), []\n    while q:\n        level = []\n        for _ in range(len(q)):\n            node = q.popleft()\n            level.append(node.val)\n            if node.left: q.append(node.left)\n            if node.right: q.append(node.right)\n        res.append(level)\n    return res',
    time_complexity: 'O(n)', space_complexity: 'O(n)',
    companies: ['Facebook', 'Amazon', 'Google']
  },

  // ─── GRAPHS ───────────────────────────────────────────────
  {
    id: 'graphs-001', title: 'Number of Islands', topic: 'graphs', difficulty: 'Easy',
    description: 'Given an m x n 2D binary grid of "1"s (land) and "0"s (water), return the number of islands. An island is surrounded by water and formed by connecting adjacent lands horizontally or vertically.',
    examples: [{ input: 'grid=[["1","1","0"],["0","1","0"],["0","0","1"]]', output: '2' }],
    hints: [
      'Each unvisited land cell "1" is the start of a new island. Count how many times you start a fresh exploration.',
      'Use DFS or BFS from each new "1" cell. Mark all connected "1" cells as visited so you do not double-count.',
      'Loop every cell. When you find "1", increment count and DFS to mark all connected land as "0" (visited).'
    ],
    solution: 'def numIslands(grid):\n    count = 0\n    def dfs(i, j):\n        if i < 0 or i >= len(grid) or j < 0 or j >= len(grid[0]) or grid[i][j] != "1": return\n        grid[i][j] = "0"\n        for di, dj in [(0,1),(0,-1),(1,0),(-1,0)]: dfs(i+di, j+dj)\n    for i in range(len(grid)):\n        for j in range(len(grid[0])):\n            if grid[i][j] == "1": count += 1; dfs(i, j)\n    return count',
    time_complexity: 'O(m*n)', space_complexity: 'O(m*n)',
    companies: ['Amazon', 'Google', 'Microsoft']
  },
  {
    id: 'graphs-002', title: 'Course Schedule (Cycle Detection)', topic: 'graphs', difficulty: 'Medium',
    description: 'There are numCourses labeled 0 to numCourses-1. Given prerequisites pairs [a,b] meaning you must take course b before a, return true if you can finish all courses.',
    examples: [{ input: 'numCourses=2, prerequisites=[[1,0]]', output: 'true' }],
    hints: [
      'This is a cycle detection problem on a directed graph. If there is a cycle, you cannot complete all courses.',
      'Build an adjacency list. Use DFS with three states per node: unvisited, in-progress, done.',
      'If during DFS you reach a node that is in-progress (currently in the call stack), a cycle exists — return false.'
    ],
    solution: 'def canFinish(numCourses, prerequisites):\n    graph = [[] for _ in range(numCourses)]\n    for a, b in prerequisites: graph[b].append(a)\n    state = [0] * numCourses\n    def dfs(node):\n        if state[node] == 1: return False\n        if state[node] == 2: return True\n        state[node] = 1\n        for nb in graph[node]:\n            if not dfs(nb): return False\n        state[node] = 2\n        return True\n    return all(dfs(i) for i in range(numCourses))',
    time_complexity: 'O(V+E)', space_complexity: 'O(V+E)',
    companies: ['Google', 'Facebook', 'Uber']
  },
  {
    id: 'graphs-003', title: 'Shortest Path in Binary Matrix', topic: 'graphs', difficulty: 'Hard',
    description: 'Given an n x n binary matrix grid, return the length of the shortest clear path from top-left (0,0) to bottom-right (n-1,n-1). A clear path uses only 0-valued cells and moves in 8 directions. Return -1 if no path exists.',
    examples: [{ input: 'grid=[[0,1],[1,0]]', output: '2' }],
    hints: [
      'Shortest path in an unweighted grid — BFS is always the right choice here.',
      'Start BFS from (0,0). Each step, explore all 8 neighbors. Track distance with the queue.',
      'Queue stores (row, col, distance). Mark cells visited when enqueued. Return distance when you reach (n-1,n-1).'
    ],
    solution: 'from collections import deque\ndef shortestPathBinaryMatrix(grid):\n    n = len(grid)\n    if grid[0][0] or grid[n-1][n-1]: return -1\n    q = deque([(0, 0, 1)])\n    grid[0][0] = 1\n    dirs = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]\n    while q:\n        r, c, d = q.popleft()\n        if r == n-1 and c == n-1: return d\n        for dr, dc in dirs:\n            nr, nc = r+dr, c+dc\n            if 0 <= nr < n and 0 <= nc < n and not grid[nr][nc]:\n                grid[nr][nc] = 1\n                q.append((nr, nc, d+1))\n    return -1',
    time_complexity: 'O(n²)', space_complexity: 'O(n²)',
    companies: ['Google', 'Facebook']
  },

  // ─── DYNAMIC PROGRAMMING ──────────────────────────────────
  {
    id: 'dp-001', title: 'Climbing Stairs', topic: 'dp', difficulty: 'Easy',
    description: 'You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?',
    examples: [{ input: 'n=3', output: '3', explanation: '1+1+1, 1+2, 2+1' }],
    hints: [
      'The number of ways to reach step n depends only on steps n-1 and n-2.',
      'ways(n) = ways(n-1) + ways(n-2). This is exactly the Fibonacci sequence.',
      'Base cases: ways(1)=1, ways(2)=2. Iterate from 3 to n, keeping only the last two values.'
    ],
    solution: 'def climbStairs(n):\n    a, b = 1, 2\n    for _ in range(n - 1): a, b = b, a + b\n    return a',
    time_complexity: 'O(n)', space_complexity: 'O(1)',
    companies: ['Amazon', 'Apple', 'Adobe']
  },
  {
    id: 'dp-002', title: 'Coin Change', topic: 'dp', difficulty: 'Medium',
    description: 'Given an array of coin denominations and a total amount, return the fewest number of coins needed to make up that amount. Return -1 if it cannot be done.',
    examples: [{ input: 'coins=[1,5,6,9], amount=11', output: '2', explanation: '5+6=11' }],
    hints: [
      'Try every possible last coin. The answer for amount A = 1 + answer for (A - coin) for the best coin.',
      'Use a dp array of size amount+1. dp[i] = min coins to make amount i.',
      'dp[0]=0. For each amount from 1 to amount, try every coin: dp[i] = min(dp[i], dp[i-coin]+1).'
    ],
    solution: 'def coinChange(coins, amount):\n    dp = [float("inf")] * (amount + 1)\n    dp[0] = 0\n    for i in range(1, amount + 1):\n        for c in coins:\n            if c <= i: dp[i] = min(dp[i], dp[i-c] + 1)\n    return dp[amount] if dp[amount] != float("inf") else -1',
    time_complexity: 'O(amount * coins)', space_complexity: 'O(amount)',
    companies: ['Google', 'Amazon', 'Microsoft']
  },
  {
    id: 'dp-003', title: 'Longest Common Subsequence', topic: 'dp', difficulty: 'Hard',
    description: 'Given two strings text1 and text2, return the length of their longest common subsequence. A subsequence is a sequence that appears in the same relative order but not necessarily contiguous.',
    examples: [{ input: 'text1="abcde", text2="ace"', output: '3', explanation: 'LCS is "ace"' }],
    hints: [
      'Consider the last characters of both strings. If they match, they are part of the LCS.',
      'Build a 2D DP table. dp[i][j] = LCS length of text1[:i] and text2[:j].',
      'If text1[i-1]==text2[j-1]: dp[i][j]=dp[i-1][j-1]+1. Else: dp[i][j]=max(dp[i-1][j], dp[i][j-1]).'
    ],
    solution: 'def longestCommonSubsequence(text1, text2):\n    m, n = len(text1), len(text2)\n    dp = [[0]*(n+1) for _ in range(m+1)]\n    for i in range(1,m+1):\n        for j in range(1,n+1):\n            if text1[i-1]==text2[j-1]: dp[i][j]=dp[i-1][j-1]+1\n            else: dp[i][j]=max(dp[i-1][j],dp[i][j-1])\n    return dp[m][n]',
    time_complexity: 'O(m*n)', space_complexity: 'O(m*n)',
    companies: ['Google', 'Amazon', 'Microsoft']
  },

  // ─── RECURSION ────────────────────────────────────────────
  {
    id: 'recursion-001', title: 'Reverse a Linked List (Recursive)', topic: 'recursion', difficulty: 'Easy',
    description: 'Given the head of a singly linked list, reverse the list recursively and return the new head.',
    examples: [{ input: '[1,2,3,4,5]', output: '[5,4,3,2,1]' }],
    hints: [
      'Reverse the rest of the list first, then fix the current node\'s pointer.',
      'The new head is the head of the reversed sublist. After recursion, head.next.next = head.',
      'Base case: if head is None or head.next is None, return head. Else: new_head = reverse(head.next); head.next.next = head; head.next = None; return new_head.'
    ],
    solution: 'def reverseList(head):\n    if not head or not head.next: return head\n    new_head = reverseList(head.next)\n    head.next.next = head\n    head.next = None\n    return new_head',
    time_complexity: 'O(n)', space_complexity: 'O(n)',
    companies: ['Amazon', 'Microsoft']
  },
  {
    id: 'recursion-002', title: 'Generate All Subsets (Power Set)', topic: 'recursion', difficulty: 'Medium',
    description: 'Given an integer array nums with unique elements, return all possible subsets (the power set). The solution must not contain duplicate subsets.',
    examples: [{ input: 'nums=[1,2,3]', output: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]' }],
    hints: [
      'At each position, you have exactly two choices: include this number or skip it.',
      'Use backtracking. At each index, branch into two recursive calls: one including nums[i], one excluding.',
      'backtrack(index, current). Base case: index==len(nums), add current copy to result. Else: include then backtrack, exclude then backtrack.'
    ],
    solution: 'def subsets(nums):\n    res = []\n    def bt(i, cur):\n        if i == len(nums): res.append(cur[:]); return\n        cur.append(nums[i]); bt(i+1, cur); cur.pop()\n        bt(i+1, cur)\n    bt(0, [])\n    return res',
    time_complexity: 'O(2^n)', space_complexity: 'O(n)',
    companies: ['Amazon', 'Facebook', 'Bloomberg']
  },
  {
    id: 'recursion-003', title: 'Word Search', topic: 'recursion', difficulty: 'Hard',
    description: 'Given an m x n grid of characters and a string word, return true if word exists in the grid. The word must be constructed from sequentially adjacent cells (horizontally or vertically). The same cell may not be used more than once.',
    examples: [{ input: 'board=[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word="ABCCED"', output: 'true' }],
    hints: [
      'Try starting from every cell that matches word[0]. From there, explore all 4 directions.',
      'Use backtracking DFS. Mark a cell as visited before recursing, and unmark it after.',
      'dfs(r, c, index): if index==len(word) return True. Check bounds, visited, and character match. Mark visited, recurse in 4 dirs, unmark visited.'
    ],
    solution: 'def exist(board, word):\n    R,C=len(board),len(board[0])\n    def dfs(r,c,i):\n        if i==len(word): return True\n        if r<0 or r>=R or c<0 or c>=C or board[r][c]!=word[i]: return False\n        tmp=board[r][c]; board[r][c]="#"\n        found=any(dfs(r+dr,c+dc,i+1) for dr,dc in [(0,1),(0,-1),(1,0),(-1,0)])\n        board[r][c]=tmp; return found\n    return any(dfs(r,c,0) for r in range(R) for c in range(C))',
    time_complexity: 'O(m*n*4^L)', space_complexity: 'O(L)',
    companies: ['Amazon', 'Facebook', 'Microsoft']
  },

  // ─── SORTING ──────────────────────────────────────────────
  {
    id: 'sorting-001', title: 'Merge Sorted Arrays', topic: 'sorting', difficulty: 'Easy',
    description: 'Given two sorted integer arrays nums1 and nums2, merge nums2 into nums1 in-place. nums1 has extra space at the end for the merged elements.',
    examples: [{ input: 'nums1=[1,2,3,0,0,0] m=3, nums2=[2,5,6] n=3', output: '[1,2,2,3,5,6]' }],
    hints: [
      'Work from the back of both arrays to avoid overwriting elements you still need.',
      'Use three pointers: one at end of valid nums1, one at end of nums2, one at end of total space.',
      'Compare from the back. Place the larger element at the back of nums1. Move that pointer left.'
    ],
    solution: 'def merge(nums1, m, nums2, n):\n    i,j,k=m-1,n-1,m+n-1\n    while j>=0:\n        if i>=0 and nums1[i]>nums2[j]: nums1[k]=nums1[i];i-=1\n        else: nums1[k]=nums2[j];j-=1\n        k-=1',
    time_complexity: 'O(m+n)', space_complexity: 'O(1)',
    companies: ['Amazon', 'Microsoft', 'Apple']
  },
  {
    id: 'sorting-002', title: 'Sort Colors (Dutch National Flag)', topic: 'sorting', difficulty: 'Medium',
    description: 'Given an array with values 0, 1, and 2 representing colors red, white, and blue, sort them in-place so all 0s come first, then 1s, then 2s. Use constant extra space.',
    examples: [{ input: 'nums=[2,0,2,1,1,0]', output: '[0,0,1,1,2,2]' }],
    hints: [
      'You need to partition the array into three sections in one pass.',
      'Use three pointers: low (next 0 position), mid (current element), high (next 2 position).',
      'If mid==0: swap with low, advance low and mid. If mid==2: swap with high, retreat high. If mid==1: just advance mid.'
    ],
    solution: 'def sortColors(nums):\n    lo,mid,hi=0,0,len(nums)-1\n    while mid<=hi:\n        if nums[mid]==0: nums[lo],nums[mid]=nums[mid],nums[lo];lo+=1;mid+=1\n        elif nums[mid]==2: nums[mid],nums[hi]=nums[hi],nums[mid];hi-=1\n        else: mid+=1',
    time_complexity: 'O(n)', space_complexity: 'O(1)',
    companies: ['Facebook', 'Microsoft']
  },
  {
    id: 'sorting-003', title: 'Largest Number', topic: 'sorting', difficulty: 'Hard',
    description: 'Given a list of non-negative integers, arrange them so that they form the largest possible number and return it as a string.',
    examples: [{ input: 'nums=[3,30,34,5,9]', output: '"9534330"' }],
    hints: [
      'The challenge is defining what "larger" means when comparing two numbers for ordering.',
      'Compare two numbers a and b by checking whether str(a)+str(b) > str(b)+str(a).',
      'Use a custom comparator with functools.cmp_to_key. Sort descending. Handle the edge case where result is all zeros.'
    ],
    solution: 'from functools import cmp_to_key\ndef largestNumber(nums):\n    nums=list(map(str,nums))\n    nums.sort(key=cmp_to_key(lambda a,b: 1 if a+b<b+a else -1))\n    return "0" if nums[0]=="0" else "".join(nums)',
    time_complexity: 'O(n log n)', space_complexity: 'O(n)',
    companies: ['Google', 'Amazon']
  },

  // ─── SEARCHING ────────────────────────────────────────────
  {
    id: 'searching-001', title: 'Binary Search', topic: 'searching', difficulty: 'Easy',
    description: 'Given a sorted array of distinct integers and a target, return the index of the target. If not found, return -1. You must use O(log n) runtime.',
    examples: [{ input: 'nums=[-1,0,3,5,9,12], target=9', output: '4' }],
    hints: [
      'You can eliminate half the array with every comparison because the array is sorted.',
      'Maintain a lo and hi pointer. Check the middle element each time.',
      'If mid==target return mid. If mid<target move lo=mid+1. If mid>target move hi=mid-1.'
    ],
    solution: 'def search(nums, target):\n    lo,hi=0,len(nums)-1\n    while lo<=hi:\n        mid=(lo+hi)//2\n        if nums[mid]==target: return mid\n        elif nums[mid]<target: lo=mid+1\n        else: hi=mid-1\n    return -1',
    time_complexity: 'O(log n)', space_complexity: 'O(1)',
    companies: ['Amazon', 'Google', 'Microsoft']
  },
  {
    id: 'searching-002', title: 'Search in Rotated Sorted Array', topic: 'searching', difficulty: 'Medium',
    description: 'A sorted array has been rotated at an unknown pivot. Given the array and a target, return the index of target or -1 if not found. Must run in O(log n).',
    examples: [{ input: 'nums=[4,5,6,7,0,1,2], target=0', output: '4' }],
    hints: [
      'Even after rotation, one half of the array around mid is always sorted.',
      'Check which half is sorted. If target is within the sorted half, search there; otherwise search the other half.',
      'if nums[lo]<=nums[mid]: left half is sorted. Check if target in [nums[lo], nums[mid]]. Adjust lo/hi accordingly.'
    ],
    solution: 'def search(nums, target):\n    lo,hi=0,len(nums)-1\n    while lo<=hi:\n        mid=(lo+hi)//2\n        if nums[mid]==target: return mid\n        if nums[lo]<=nums[mid]:\n            if nums[lo]<=target<nums[mid]: hi=mid-1\n            else: lo=mid+1\n        else:\n            if nums[mid]<target<=nums[hi]: lo=mid+1\n            else: hi=mid-1\n    return -1',
    time_complexity: 'O(log n)', space_complexity: 'O(1)',
    companies: ['Facebook', 'Amazon', 'Microsoft']
  },
  {
    id: 'searching-003', title: 'Median of Two Sorted Arrays', topic: 'searching', difficulty: 'Hard',
    description: 'Given two sorted arrays nums1 and nums2 of sizes m and n, return the median of the two combined sorted arrays. Must run in O(log(m+n)).',
    examples: [{ input: 'nums1=[1,3], nums2=[2]', output: '2.0' }],
    hints: [
      'You need to find the correct partition point in both arrays simultaneously.',
      'Binary search on the smaller array. For each partition of nums1, calculate the required partition of nums2.',
      'Ensure max(left halves) <= min(right halves). If left1 > right2 move partition left; if left2 > right1 move right.'
    ],
    solution: 'def findMedianSortedArrays(nums1, nums2):\n    if len(nums1)>len(nums2): nums1,nums2=nums2,nums1\n    m,n=len(nums1),len(nums2); lo,hi=0,m\n    while lo<=hi:\n        i=(lo+hi)//2; j=(m+n+1)//2-i\n        l1=nums1[i-1] if i>0 else float("-inf")\n        r1=nums1[i] if i<m else float("inf")\n        l2=nums2[j-1] if j>0 else float("-inf")\n        r2=nums2[j] if j<n else float("inf")\n        if l1<=r2 and l2<=r1:\n            if (m+n)%2: return max(l1,l2)\n            return (max(l1,l2)+min(r1,r2))/2\n        elif l1>r2: hi=i-1\n        else: lo=i+1',
    time_complexity: 'O(log(min(m,n)))', space_complexity: 'O(1)',
    companies: ['Google', 'Amazon', 'Apple']
  },

  // ─── STRINGS ──────────────────────────────────────────────
  {
    id: 'strings-001', title: 'Valid Palindrome', topic: 'strings', difficulty: 'Easy',
    description: 'A phrase is a palindrome if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string s, return true if it is a palindrome.',
    examples: [{ input: 's="A man, a plan, a canal: Panama"', output: 'true' }],
    hints: [
      'Clean the string first: keep only letters and digits, convert to lowercase.',
      'Compare the cleaned string with its reverse.',
      'Or use two pointers: one at start, one at end, skip non-alphanumeric, compare characters.'
    ],
    solution: 'def isPalindrome(s):\n    s="".join(c.lower() for c in s if c.isalnum())\n    return s==s[::-1]',
    time_complexity: 'O(n)', space_complexity: 'O(n)',
    companies: ['Facebook', 'Microsoft']
  },
  {
    id: 'strings-002', title: 'Longest Substring Without Repeating Characters', topic: 'strings', difficulty: 'Medium',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    examples: [{ input: 's="abcabcbb"', output: '3', explanation: '"abc" is the longest' }],
    hints: [
      'Use a sliding window that expands right and shrinks left when a duplicate is found.',
      'A set or dictionary tracks which characters are in the current window.',
      'When you see a duplicate char at right, move left pointer past the previous occurrence of that char.'
    ],
    solution: 'def lengthOfLongestSubstring(s):\n    seen={}; lo=res=0\n    for hi,c in enumerate(s):\n        if c in seen and seen[c]>=lo: lo=seen[c]+1\n        seen[c]=hi; res=max(res,hi-lo+1)\n    return res',
    time_complexity: 'O(n)', space_complexity: 'O(min(n,alphabet))',
    companies: ['Amazon', 'Bloomberg', 'Adobe']
  },
  {
    id: 'strings-003', title: 'Minimum Window Substring', topic: 'strings', difficulty: 'Hard',
    description: 'Given strings s and t, return the minimum window substring of s that contains all characters in t. Return "" if no such window exists.',
    examples: [{ input: 's="ADOBECODEBANC", t="ABC"', output: '"BANC"' }],
    hints: [
      'Use a sliding window. Expand right until all chars of t are covered. Then shrink left to find the minimum.',
      'Track character frequencies of t in a need map. A formed counter tracks how many chars are fully satisfied.',
      'When formed==len(need), record window size. Move left to try shrinking. Repeat until right reaches end.'
    ],
    solution: 'from collections import Counter\ndef minWindow(s,t):\n    need=Counter(t); miss=len(t); lo=0; res=""\n    for hi,c in enumerate(s):\n        if need[c]>0: miss-=1\n        need[c]-=1\n        if miss==0:\n            while need[s[lo]]<0: need[s[lo]]+=1;lo+=1\n            if not res or hi-lo+1<len(res): res=s[lo:hi+1]\n            need[s[lo]]+=1;miss+=1;lo+=1\n    return res',
    time_complexity: 'O(|s|+|t|)', space_complexity: 'O(|t|)',
    companies: ['Facebook', 'LinkedIn', 'Snapchat']
  },

  // ─── HEAPS ────────────────────────────────────────────────
  {
    id: 'heaps-001', title: 'Kth Largest Element', topic: 'heaps', difficulty: 'Easy',
    description: 'Given an integer array and an integer k, return the kth largest element in the array. Note: it is the kth largest in sorted order, not the kth distinct element.',
    examples: [{ input: 'nums=[3,2,1,5,6,4], k=2', output: '5' }],
    hints: [
      'You need the kth largest — a min-heap of size k keeps the k largest elements seen so far.',
      'Push each element into the heap. If heap size exceeds k, pop the smallest.',
      'After processing all elements, the top of the min-heap (smallest of the k largest) is the kth largest.'
    ],
    solution: 'import heapq\ndef findKthLargest(nums, k):\n    heap=[]\n    for n in nums:\n        heapq.heappush(heap,n)\n        if len(heap)>k: heapq.heappop(heap)\n    return heap[0]',
    time_complexity: 'O(n log k)', space_complexity: 'O(k)',
    companies: ['Facebook', 'Amazon', 'LinkedIn']
  },
  {
    id: 'heaps-002', title: 'Top K Frequent Elements', topic: 'heaps', difficulty: 'Medium',
    description: 'Given an integer array and an integer k, return the k most frequent elements. You may return the answer in any order.',
    examples: [{ input: 'nums=[1,1,1,2,2,3], k=2', output: '[1,2]' }],
    hints: [
      'First count the frequency of each element using a hashmap.',
      'Then find the k elements with the highest frequency — a min-heap of size k works perfectly.',
      'Push (frequency, element) pairs. Pop when size > k. The remaining k elements are the answer.'
    ],
    solution: 'from collections import Counter\nimport heapq\ndef topKFrequent(nums, k):\n    count=Counter(nums)\n    return heapq.nlargest(k, count, key=count.get)',
    time_complexity: 'O(n log k)', space_complexity: 'O(n)',
    companies: ['Amazon', 'Bloomberg', 'Yelp']
  },
  {
    id: 'heaps-003', title: 'Find Median from Data Stream', topic: 'heaps', difficulty: 'Hard',
    description: 'Design a data structure that supports addNum(int num) and findMedian() operations. findMedian returns the median of all elements added so far.',
    examples: [{ input: 'addNum(1), addNum(2), findMedian() → 1.5, addNum(3), findMedian() → 2.0', output: '' }],
    hints: [
      'Split numbers into two halves: the smaller half and the larger half.',
      'Use a max-heap for the lower half and a min-heap for the upper half. Keep them balanced in size.',
      'addNum: push to max-heap, then balance by moving top of max-heap to min-heap if needed. findMedian: if equal size, average the tops; else return top of larger heap.'
    ],
    solution: 'import heapq\nclass MedianFinder:\n    def __init__(self): self.lo,self.hi=[],[]\n    def addNum(self,num):\n        heapq.heappush(self.lo,-num)\n        heapq.heappush(self.hi,-heapq.heappop(self.lo))\n        if len(self.hi)>len(self.lo): heapq.heappush(self.lo,-heapq.heappop(self.hi))\n    def findMedian(self):\n        if len(self.lo)>len(self.hi): return -self.lo[0]\n        return(-self.lo[0]+self.hi[0])/2',
    time_complexity: 'O(log n) add, O(1) median', space_complexity: 'O(n)',
    companies: ['Google', 'Amazon', 'Microsoft']
  },

  // ─── LINKED LISTS ─────────────────────────────────────────
  {
    id: 'linked_lists-001', title: 'Detect Cycle in Linked List', topic: 'linked_lists', difficulty: 'Easy',
    description: 'Given the head of a linked list, return true if there is a cycle (some node can be reached again by following next pointers).',
    examples: [{ input: 'head=[3,2,0,-4], pos=1', output: 'true' }],
    hints: [
      'Imagine two runners on a circular track — a fast one and a slow one. If there is a loop, they must eventually meet.',
      'Use two pointers: slow moves 1 step, fast moves 2 steps.',
      'If fast or fast.next becomes None, there is no cycle. If slow==fast, a cycle exists.'
    ],
    solution: 'def hasCycle(head):\n    slow=fast=head\n    while fast and fast.next:\n        slow=slow.next; fast=fast.next.next\n        if slow==fast: return True\n    return False',
    time_complexity: 'O(n)', space_complexity: 'O(1)',
    companies: ['Amazon', 'Bloomberg', 'Microsoft']
  },
  {
    id: 'linked_lists-002', title: 'Merge Two Sorted Lists', topic: 'linked_lists', difficulty: 'Medium',
    description: 'Given the heads of two sorted linked lists, merge them into one sorted linked list and return its head.',
    examples: [{ input: 'l1=[1,2,4], l2=[1,3,4]', output: '[1,1,2,3,4,4]' }],
    hints: [
      'Use a dummy head node to simplify edge cases. Build the merged list by choosing the smaller node each time.',
      'Two pointers — one in each list. Always attach the smaller current node to the result.',
      'When one list runs out, attach the remainder of the other list directly.'
    ],
    solution: 'def mergeTwoLists(l1, l2):\n    dummy=cur=ListNode(0)\n    while l1 and l2:\n        if l1.val<=l2.val: cur.next=l1;l1=l1.next\n        else: cur.next=l2;l2=l2.next\n        cur=cur.next\n    cur.next=l1 or l2\n    return dummy.next',
    time_complexity: 'O(m+n)', space_complexity: 'O(1)',
    companies: ['Amazon', 'Microsoft', 'Apple']
  },
  {
    id: 'linked_lists-003', title: 'LRU Cache', topic: 'linked_lists', difficulty: 'Hard',
    description: 'Design a data structure that follows the Least Recently Used cache constraint. Implement get(key) and put(key, value) — both must run in O(1).',
    examples: [{ input: 'LRUCache(2), put(1,1), put(2,2), get(1)→1, put(3,3) evicts 2, get(2)→-1', output: '' }],
    hints: [
      'You need O(1) lookup AND O(1) ordering by recency — combine a hashmap with a doubly linked list.',
      'Hashmap maps key → node. Doubly linked list maintains order: most recent at head, least recent at tail.',
      'get: move node to head. put: add to head, if over capacity remove tail node and delete from hashmap.'
    ],
    solution: 'class LRUCache:\n    def __init__(self,capacity):\n        self.cap=capacity; self.cache={}\n        self.head,self.tail=Node(0,0),Node(0,0)\n        self.head.next=self.tail; self.tail.prev=self.head\n    def _remove(self,node):\n        node.prev.next=node.next; node.next.prev=node.prev\n    def _insert(self,node):\n        node.next=self.head.next; node.prev=self.head\n        self.head.next.prev=node; self.head.next=node\n    def get(self,key):\n        if key not in self.cache: return -1\n        self._remove(self.cache[key]); self._insert(self.cache[key]); return self.cache[key].val\n    def put(self,key,val):\n        if key in self.cache: self._remove(self.cache[key])\n        self.cache[key]=Node(key,val); self._insert(self.cache[key])\n        if len(self.cache)>self.cap: lru=self.tail.prev; self._remove(lru); del self.cache[lru.key]',
    time_complexity: 'O(1) get and put', space_complexity: 'O(capacity)',
    companies: ['Amazon', 'Google', 'Microsoft', 'Facebook']
  },

];

async function seed() {
  console.log(`Seeding ${problems.length} problems...`);
  const { error } = await supabase.from('problems_bank').upsert(problems, { onConflict: 'id' });
  if (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
  console.log(`Successfully seeded ${problems.length} problems across 10 DSA topics.`);
  console.log('Topics: arrays, trees, graphs, dp, recursion, sorting, searching, strings, heaps, linked_lists');
}

seed();