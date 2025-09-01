import { ASCII_CHAR_COUNT } from '../utils/constants';

export interface TrigramCounts {
  trigramCounts: number[][][];
  beginTrigramCounts: number[][];
  endTrigramCounts: number[][];
  totalTrigrams: number;
}

export interface TrigramProbabilities {
  trigramProbs: number[][][];
  beginTrigramProbs: number[][];
  endTrigramProbs: number[][];
}

export class TrigramModel {
  private trigramProbs: number[][][];
  private beginTrigramProbs: number[][];
  private endTrigramProbs: number[][];
  private modelType: string = '';
  private isLowerCase: boolean = false;

  constructor() {
    // Initialize arrays for log probabilities
    this.trigramProbs = this.create3DArray();
    this.beginTrigramProbs = this.create2DArray();
    this.endTrigramProbs = this.create2DArray();
  }

  private create3DArray(): number[][][] {
    const arr: number[][][] = [];
    for (let i = 0; i < ASCII_CHAR_COUNT; i++) {
      arr[i] = [];
      for (let j = 0; j < ASCII_CHAR_COUNT; j++) {
        arr[i][j] = new Array(ASCII_CHAR_COUNT).fill(0);
      }
    }
    return arr;
  }

  private create2DArray(): number[][] {
    const arr: number[][] = [];
    for (let i = 0; i < ASCII_CHAR_COUNT; i++) {
      arr[i] = new Array(ASCII_CHAR_COUNT).fill(0);
    }
    return arr;
  }

  public loadFromCounts(counts: TrigramCounts, modelType: string): void {
    this.modelType = modelType;
    this.isLowerCase = modelType.toLowerCase() === 'lowercase';
    
    // Create copies of the counts for smoothing
    const trigramCounts = this.deepCopy3D(counts.trigramCounts);
    const beginTrigramCounts = this.deepCopy2D(counts.beginTrigramCounts);
    const endTrigramCounts = this.deepCopy2D(counts.endTrigramCounts);
    let totalTrigrams = counts.totalTrigrams;

    // Apply Laplace smoothing (add 1 to all zero counts)
    for (let i = 0; i < ASCII_CHAR_COUNT; i++) {
      for (let j = 0; j < ASCII_CHAR_COUNT; j++) {
        if (beginTrigramCounts[i][j] === 0) {
          beginTrigramCounts[i][j] = 1;
          totalTrigrams++;
        }
        
        if (endTrigramCounts[i][j] === 0) {
          endTrigramCounts[i][j] = 1;
          totalTrigrams++;
        }

        for (let k = 0; k < ASCII_CHAR_COUNT; k++) {
          if (trigramCounts[i][j][k] === 0) {
            trigramCounts[i][j][k] = 1;
            totalTrigrams++;
          }
        }
      }
    }

    // Calculate log probabilities (base 10)
    for (let i = 0; i < ASCII_CHAR_COUNT; i++) {
      for (let j = 0; j < ASCII_CHAR_COUNT; j++) {
        this.beginTrigramProbs[i][j] = Math.log10(beginTrigramCounts[i][j] / totalTrigrams);
        this.endTrigramProbs[i][j] = Math.log10(endTrigramCounts[i][j] / totalTrigrams);

        for (let k = 0; k < ASCII_CHAR_COUNT; k++) {
          this.trigramProbs[i][j][k] = Math.log10(trigramCounts[i][j][k] / totalTrigrams);
        }
      }
    }
  }

  private deepCopy3D(arr: number[][][]): number[][][] {
    const copy: number[][][] = [];
    for (let i = 0; i < arr.length; i++) {
      copy[i] = [];
      for (let j = 0; j < arr[i].length; j++) {
        copy[i][j] = [...arr[i][j]];
      }
    }
    return copy;
  }

  private deepCopy2D(arr: number[][]): number[][] {
    return arr.map(row => [...row]);
  }

  public getTrigramProb(char1: number, char2: number, char3: number): number {
    return this.trigramProbs[char1][char2][char3];
  }

  public getBeginTrigramProb(char1: number, char2: number): number {
    return this.beginTrigramProbs[char1][char2];
  }

  public getEndTrigramProb(char1: number, char2: number): number {
    return this.endTrigramProbs[char1][char2];
  }

  public getModelType(): string {
    return this.modelType;
  }

  public isLowerCaseModel(): boolean {
    return this.isLowerCase;
  }

  public getProbabilities(): TrigramProbabilities {
    return {
      trigramProbs: this.trigramProbs,
      beginTrigramProbs: this.beginTrigramProbs,
      endTrigramProbs: this.endTrigramProbs
    };
  }
}