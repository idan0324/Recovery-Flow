
# Fix Guided Stretching Timer Bug

## Problem Analysis

The timer stops at 44 seconds due to a **React closure/dependency issue** in the timer's useEffect hook.

**Root Cause:**
1. The `startTransition` callback includes `totalActiveTime` in its dependency array
2. The main timer useEffect includes `startTransition` in its dependencies
3. Every second, `setTotalActiveTime(t => t + 1)` updates the state
4. This causes `startTransition` to be recreated, which triggers the useEffect cleanup and recreation
5. The interval gets cleared and recreated repeatedly, causing the timer to freeze

**Why it stops at exactly 44:**
- A stretch with 45-second duration (like Cat-Cow) starts
- The first second ticks, updating `totalActiveTime` from 0 to 1
- This triggers the cascade of dependency updates
- The interval gets recreated with stale closure state

## Solution

Stabilize the `startTransition` callback by removing `totalActiveTime` from its closure and using a ref to access the current value when needed.

### Technical Changes

**File: `src/components/StretchTimer.tsx`**

1. **Add a ref to track `totalActiveTime`** (avoids stale closure)
   ```typescript
   const totalActiveTimeRef = useRef(0);
   ```

2. **Keep the ref in sync with state**
   ```typescript
   useEffect(() => {
     totalActiveTimeRef.current = totalActiveTime;
   }, [totalActiveTime]);
   ```

3. **Update `startTransition` to use the ref**
   - Change `onComplete(totalActiveTime)` to `onComplete(totalActiveTimeRef.current)`
   - Remove `totalActiveTime` from the dependency array

4. **Update `skipToNext` similarly**
   - Use `totalActiveTimeRef.current` instead of `totalActiveTime` for the final calculation
   - Remove `totalActiveTime` from its dependency array

### Why This Works

- Refs don't trigger re-renders when updated
- The `startTransition` callback no longer depends on `totalActiveTime` state
- The useEffect won't be recreated every second
- The interval remains stable throughout the stretch duration
- When `onComplete` is called, it reads the current value from the ref

### Files Modified

- `src/components/StretchTimer.tsx`
