# UltraGoal: Debug, Enhance & Production-Ready Webpage

**Brief**: Debug, enhance, harden, and make the Eiger Marvel HR webpage production-ready with correct rendering of all features — especially slideshow 1 and slideshow 2 (dual GSAP Ken Burns slideshows in HeroSection).

**Stories**:

1. **G001-investigate**: Deep investigation of slideshow 1 & 2 rendering issues
   - Identify root causes of broken crossfade, timer conflicts, image loading failures
   - Document all bugs: z-index, opacity, timer mismatch, GSAP animation conflicts
   - Check image assets exist and load correctly
   - Map the full rendering pipeline

2. **G002-fix-slideshows**: Fix slideshow core rendering logic
   - Fix crossfade transition bugs (opacity, scale, gsap.fromTo ordering)
   - Fix timer management (no stale closures, proper cleanup on unmount)
   - Fix Ken Burns animation application timing
   - Fix seq switching (show/hide toggling between slideshow 1 & 2)
   - Ensure smooth cycle restart when switching sequences

3. **G003-harden**: Production hardening
   - Image preloading with loading states
   - Handle missing/broken images gracefully
   - Error boundary for slideshow component
   - Performance: lazy loading, proper cleanup
   - Responsive edge cases
   - Reduced motion support verification

4. **G004-enhance**: Polish animations and UX
   - Smooth transition timing
   - Proper z-index layering
   - Ensure no visual flash on sequence switch
   - Verify gradient overlay consistency
   - Cross-browser testing prep

5. **G005-quality-gate**: Final verification and commit
   - Build check (`npm run build`)
   - LSP diagnostics clean
   - Code review
   - Commit to samanabran main

**Claude Goal Mode**: aggregate
**Expected Completion**: All 5 stories checkpointed with evidence
