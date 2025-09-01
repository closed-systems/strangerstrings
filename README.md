# StrangerStrings
![Stranger Strings](strangerstrings.png)


A TypeScript module for extracting human-readable strings from binary files and determining which are most likely to be useful for human analysts. This implementation is compatible with the Ghidra string analysis algorithm and uses trigram-based scoring to filter out random character sequences while preserving meaningful strings.


## Features

- **Trigram-based scoring**: Uses character trigram probabilities to score string quality
- **Ghidra compatibility**: Compatible with Ghidra's .sng model files and scoring algorithm.  
- **Binary analysis**: Extract and analyze strings directly from binary files
- **Adaptive thresholds**: Length-based scoring thresholds (shorter strings need higher scores)
- **ASCII normalization**: Handles non-ASCII characters and space normalization
- **TypeScript**: Full type safety and modern ES features, but I'll likely cut it over to Rust
- **No Runtime Dependencies**: We don't drag in the kitchen sink, just the Typescript basics and a testing library.

## Effectiveness
I'm not going over 9600 failed strings to find FN, but spot checking was all strangely perfect.

```
$ strings ./tasmota-UK.bin|wc -l
   12695

$ strangerstrings -v ./tasmota-UK.bin |head -n 20
Loading model: ./StringModel.sng
Model type: lowercase, Lowercase: true
Analyzing file: ./tasmota-UK.bin
Extracted 11011 candidate strings (min length: 4)
String              Score       Threshold   Offset    Valid
----------------------------------------------------------------------
" tER"              -2.026      10.000      0x69DD5   ✗
"AND "              -2.274      10.000      0x96982   ✗
"tele"              -2.386      -2.710      0x97BD2   ✓
"none"              -2.395      -2.710      0x9A02B   ✓
"none"              -2.395      -2.710      0xA4CF8   ✓
" GET"              -2.398      10.000      0x98116   ✗
"STATE"             -2.415      -3.260      0x97B80   ✓
"  tRa"             -2.420      10.000      0x49A16   ✗
"Action"            -2.423      -3.520      0x96DCF   ✓
"user"              -2.443      -2.710      0x9830B   ✓
"scan"              -2.453      -2.710      0x99310   ✓
"center"            -2.472      -3.520      0x97A76   ✓
"POST"              -2.498      -2.710      0xA5186   ✓
"       aRA"              -2.505      10.000      0x69849   ✗
"Done"              -2.506      -2.710      0x9B8AB   ✓
"stat"              -2.518      -2.710      0x97BD7   ✓
"BASE"              -2.524      -2.710      0x9BC91   ✓
"Mode"              -2.542      -2.710      0x95F91   ✓

Summary:
  Accepted: 1375 strings
  Rejected: 9636 strings
  Total: 11011 strings
  Acceptance rate: 12.5%
```


## Installation

```bash
npm install strangerstrings
```

or with pnpm:

```bash
pnpm add strangerstrings
```

## Quick Start

```typescript
import { StrangerStrings } from 'strangerstrings';
import * as fs from 'fs';

// Initialize analyzer with model
const analyzer = new StrangerStrings();
await analyzer.loadModel({ modelPath: './StringModel.sng' });

// Analyze individual strings
const result = analyzer.analyzeString('hello world');
console.log(`Valid: ${result.isValid}, Score: ${result.score}`);

// Analyze binary file
const binaryData = fs.readFileSync('./program.exe');
const validStrings = analyzer.analyzeBinaryFile(binaryData);
console.log(`Found ${validStrings.length} valid strings`);
```

## API Reference

### StrangerStrings Class

#### Constructor
```typescript
const analyzer = new StrangerStrings();
```

#### loadModel(options)
Load a trigram model from file or string content.

```typescript
// From file
await analyzer.loadModel({ modelPath: './StringModel.sng' });

// From string content  
await analyzer.loadModel({ modelContent: modelFileContent });
```

#### analyzeString(candidateString)
Analyze a single string and return detailed scoring information.

```typescript
const result = analyzer.analyzeString('hello world');
// Returns: StringAnalysisResult
// {
//   originalString: 'hello world',
//   score: -4.123,
//   threshold: -5.42,
//   isValid: true,
//   normalizedString: 'hello world'
// }
```

#### analyzeStrings(candidateStrings)
Analyze multiple strings at once.

```typescript
const results = analyzer.analyzeStrings(['hello', 'world', 'xZ#@$%']);
```

#### extractValidStrings(candidateStrings)
Get only the valid strings from a list of candidates.

```typescript
const validOnly = analyzer.extractValidStrings(['hello', 'world', 'xZ#@$%']);
// Returns only strings that pass the scoring threshold
```

#### analyzeBinaryFile(buffer, options?)
Extract and analyze strings from binary data.

```typescript
const binaryData = fs.readFileSync('./program.exe');
const validStrings = analyzer.analyzeBinaryFile(binaryData, { 
  minLength: 6  // minimum string length to extract
});
```

#### extractStringsFromBinary(buffer, minLength?)
Extract raw strings from binary data without scoring.

```typescript
const strings = analyzer.extractStringsFromBinary(binaryData, 4);
```

### Convenience Functions

```typescript
import { analyzeStringsWithModel, analyzeBinaryWithModel } from 'strangerstrings';

// Quick analysis without creating class instance
const results = await analyzeStringsWithModel(
  ['string1', 'string2'], 
  './StringModel.sng'
);

const validStrings = await analyzeBinaryWithModel(
  binaryBuffer, 
  './StringModel.sng'
);
```

## Model Files

The module uses `.sng` model files containing trigram frequency data. These are tab-delimited text files with the format:

```
# Model Type: lowercase
# Training file: words.txt
# [^] denotes beginning of string  
# [$] denotes end of string
# [SP] denotes space

char1	char2	char3	count
[^]	h	e	1234
h	e	l	5678
l	l	o	9012
o	[$]	[$]	3456
```

## Algorithm Details

The scoring algorithm works as follows:

1. **Normalization**: Convert to lowercase (if using lowercase model), trim spaces, replace non-ASCII with spaces
2. **Trigram Analysis**: Calculate probability for each 3-character sequence
3. **Scoring**: Sum log probabilities and divide by string length  
4. **Thresholding**: Compare against length-based thresholds
5. **Smoothing**: Apply Laplace smoothing for unseen trigrams

### Scoring Formula
```
score = (Σ log10(P(trigram))) / string_length
```

### Length-based Thresholds
- Length 4: -2.71
- Length 5: -3.26  
- Length 10: -4.55
- Length 50+: -6.13
- Length 100+: -6.3

Strings shorter than 4 characters receive a default score of -20 and thresholds impossible to pass.

## Examples

See the `examples/` directory for complete usage examples:

- `basic-usage.ts` - Basic string analysis
- `binary-analysis.ts` - Binary file processing

```bash
# Run examples
npx ts-node examples/basic-usage.ts
npx ts-node examples/binary-analysis.ts
```

## Testing

```bash
# Run tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests once
pnpm test:run
```

## Compatibility

This implementation produces scoring results compatible with the Java implementation from Ghidra. The algorithm uses:

- Base-10 logarithms (`Math.log10`)
- Identical smoothing and probability calculations  
- Same threshold values and length-based scoring
- Compatible .sng model file format
- Needs some proper kicking but spot checking seems right


## Future Ideas


- I could nitpick the corpus that the Ghidra team used to make the dataset but I can't think of anything better with any baseline of truth so I stick with theirs. As noted in https://github.com/NationalSecurityAgency/ghidra/issues/2106 it's a bit to adapt or extend their model but with a good idea of finding the wheat and chaffe for a training set a good multilingual approach could likely be found (I'm looking at you stats nerds).
- it could benefit in a re-write in Rust
- Multilanguage is definitely a gap, as is base64.
- If it was going to be really fancy it could examine the binary to determine the base and look for pointers as string offsets (for languages without C strings)

## License

Lets say Apache License 2.0, as thats what StringModel.sng is under, most likely 

## Contributing

Contributions welcome! Please ensure tests pass and new features include appropriate test coverage.

Claude helped with this implementation but if you're going to submit LLM aided code you better understand it lest you be mocked.