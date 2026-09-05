Put the supplied Colosseum logo here, named exactly:

    colosseum-logo.png

That is the file the app header loads (see src/components/Wordmark.tsx).
It is used as-is — the app applies no recreation or recolouring. The header
uses CSS mix-blend-mode: screen, which drops the black background out of the
artwork and leaves only the neon glow, so either a black-background or a
background-removed PNG will blend correctly.

Until the file exists the header simply renders without it.
