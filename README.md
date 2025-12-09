#### DSTM 🌊

Here's a very rough draft. Only ~ 80 lines of code. Which means even I could do it in javascript if that's easier.

Notes:

*   Replace the two sample images with EVERYTHING on shopify.

*   Add semantic search instead of a regex-based best picture context.

*   Extend to multi-turn prompting, chat style.

*   Lock any IP address out after one generation.

*   Add system prompt to constrain generation.

*   Get the best matching designs from the cataloque (how: keywords?)

*   If they buy an existing design and don't go through with the generation, tag the sale somehow.

*   Tie in to shopify checkout. 

*   Tag the sale so it's apparent that it's a custom order.

#### Installation

If you have nix package manager with flakes enabled, clone this repo, cd into the folder, and type 'nix develop', launch ipython, and run `%load src/app.py` or from the command line `python -m src:app.py.
