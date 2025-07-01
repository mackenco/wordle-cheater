import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Search, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react-native';
import { wordList } from '@/data/wordList';

type LetterState = 'normal' | 'excluded' | 'included';

interface LetterStates {
  [key: string]: LetterState;
}

const QWERTY_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

export default function WordleCheater() {
  const [pattern, setPattern] = useState('');
  const [letterStates, setLetterStates] = useState<LetterStates>({});
  const [keyboardExpanded, setKeyboardExpanded] = useState(true);

  const excludedLetters = useMemo(() => {
    return Object.keys(letterStates)
      .filter(letter => letterStates[letter] === 'excluded')
      .join('');
  }, [letterStates]);

  const includedLetters = useMemo(() => {
    return Object.keys(letterStates)
      .filter(letter => letterStates[letter] === 'included')
      .join('');
  }, [letterStates]);

  const filteredWords = useMemo(() => {
    if (!pattern.trim()) return [];

    const patternRegex = new RegExp(
      '^' + pattern.toLowerCase().replace(/\?/g, '[a-z]') + '$'
    );

    const excluded = excludedLetters
      .toLowerCase()
      .split('')
      .filter(l => l.match(/[a-z]/));
    const included = includedLetters
      .toLowerCase()
      .split('')
      .filter(l => l.match(/[a-z]/));

    const results = wordList.filter(word => {
      // Check if word matches pattern
      if (!patternRegex.test(word)) return false;

      // Check if word contains excluded letters
      if (excluded.some(letter => word.includes(letter))) return false;

      // Check if word contains all included letters
      if (
        included.length > 0 &&
        !included.every(letter => word.includes(letter))
      )
        return false;

      return true;
    });

    // Sort by word frequency/commonality (if available) or alphabetically
    return results.sort().slice(0, 100); // Increased limit to 100
  }, [pattern, excludedLetters, includedLetters]);

  const totalMatches = useMemo(() => {
    if (!pattern.trim()) return 0;

    const patternRegex = new RegExp(
      '^' + pattern.toLowerCase().replace(/\?/g, '[a-z]') + '$'
    );
    const excluded = excludedLetters
      .toLowerCase()
      .split('')
      .filter(l => l.match(/[a-z]/));
    const included = includedLetters
      .toLowerCase()
      .split('')
      .filter(l => l.match(/[a-z]/));

    return wordList.filter(word => {
      if (!patternRegex.test(word)) return false;
      if (excluded.some(letter => word.includes(letter))) return false;
      if (
        included.length > 0 &&
        !included.every(letter => word.includes(letter))
      )
        return false;
      return true;
    }).length;
  }, [pattern, excludedLetters, includedLetters]);

  const clearAll = () => {
    setPattern('');
    setLetterStates({});
    setKeyboardExpanded(true); // Expand keyboard when clearing to help user start fresh
  };

  const handlePatternChange = (text: string) => {
    // Only allow letters and question marks, max 5 characters
    const cleaned = text
      .toLowerCase()
      .replace(/[^a-z?]/g, '')
      .slice(0, 5);
    setPattern(cleaned);

    // Auto-include letters from the pattern and clean up removed ones
    const patternLetters = cleaned.replace(/\?/g, '').split('');
    const previousPatternLetters = pattern.replace(/\?/g, '').split('');

    setLetterStates(prev => {
      const newStates = { ...prev };

      // Add new pattern letters as included
      patternLetters.forEach(letter => {
        if (letter.match(/[a-z]/)) {
          newStates[letter] = 'included';
        }
      });

      // Remove letters that were in the old pattern but not in the new pattern
      // (only if they were auto-included, not manually set)
      previousPatternLetters.forEach(letter => {
        if (!patternLetters.includes(letter) && letter.match(/[a-z]/)) {
          // Only remove if it was auto-included (we can't perfectly detect this,
          // but we'll remove it to keep things clean)
          delete newStates[letter];
        }
      });

      return newStates;
    });
  };

  const handleLetterPress = (letter: string) => {
    // Don't allow changing state of letters that are in the pattern
    const patternLetters = pattern.replace(/\?/g, '').split('');
    if (patternLetters.includes(letter)) {
      return; // Exit early if letter is in pattern
    }

    setLetterStates(prev => {
      const currentState = prev[letter] || 'normal';
      let newState: LetterState;

      switch (currentState) {
        case 'normal':
          newState = 'excluded';
          break;
        case 'excluded':
          newState = 'included';
          break;
        case 'included':
          newState = 'normal';
          break;
        default:
          newState = 'normal';
      }

      if (newState === 'normal') {
        const { [letter]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [letter]: newState,
      };
    });
  };

  const getLetterStyle = (letter: string) => {
    const patternLetters = pattern.replace(/\?/g, '').split('');
    const isInPattern = patternLetters.includes(letter);
    const state = letterStates[letter] || 'normal';

    if (isInPattern) {
      return [styles.keyboardKey, styles.includedKey, styles.lockedKey];
    }

    switch (state) {
      case 'excluded':
        return [styles.keyboardKey, styles.excludedKey];
      case 'included':
        return [styles.keyboardKey, styles.includedKey];
      default:
        return [styles.keyboardKey];
    }
  };

  const getLetterTextStyle = (letter: string) => {
    const state = letterStates[letter] || 'normal';
    switch (state) {
      case 'excluded':
        return [styles.keyText, styles.excludedText];
      case 'included':
        return [styles.keyText, styles.includedText];
      default:
        return [styles.keyText];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Wordle Cheater</Text>
          <Text style={styles.subtitle}>
            Find possible words for your Wordle puzzle
          </Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Word Pattern</Text>
            <Text style={styles.hint}>
              Use ? for unknown letters (e.g., ?o??y)
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.patternInput}
                value={pattern}
                onChangeText={handlePatternChange}
                placeholder="?o??y"
                placeholderTextColor="#9ca3af"
                maxLength={5}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.patternDisplay}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.letterBox,
                      pattern[index] &&
                        pattern[index] !== '?' &&
                        styles.letterBoxFilled,
                    ]}
                  >
                    <Text style={styles.letterText}>
                      {pattern[index] || '?'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
                <RotateCcw size={16} color="#ef4444" />
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.inputGroupLast}>
            <TouchableOpacity
              style={styles.keyboardHeader}
              onPress={() => setKeyboardExpanded(!keyboardExpanded)}
              activeOpacity={0.7}
            >
              <Text style={styles.label}>Letter Status</Text>
              {keyboardExpanded ? (
                <ChevronUp size={20} color="#6b7280" />
              ) : (
                <ChevronDown size={20} color="#6b7280" />
              )}
            </TouchableOpacity>

            {keyboardExpanded && (
              <>
                <Text style={styles.hint}>
                  Tap once to exclude • Tap twice to include
                </Text>

                <View style={styles.keyboard}>
                  {QWERTY_ROWS.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.keyboardRow}>
                      {row.map(letter => (
                        <TouchableOpacity
                          key={letter}
                          style={getLetterStyle(letter)}
                          onPress={() => handleLetterPress(letter)}
                          activeOpacity={0.7}
                        >
                          <Text style={getLetterTextStyle(letter)}>
                            {letter.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </View>

                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendBox, styles.excludedKey]} />
                    <Text style={styles.legendText}>
                      Excluded ({excludedLetters.length})
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendBox, styles.includedKey]} />
                    <Text style={styles.legendText}>
                      Included ({includedLetters.length})
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>

          <View style={styles.resultsHeader}>
            <Search size={20} color="#10b981" />
            <Text style={styles.resultsTitle}>
              Possible Words ({filteredWords.length}
              {totalMatches > filteredWords.length && ` of ${totalMatches}`})
            </Text>
          </View>
          {totalMatches > filteredWords.length && (
            <Text style={styles.truncationWarning}>
              Showing first {filteredWords.length} results. Refine your search
              for fewer matches.
            </Text>
          )}

          {pattern.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Enter a word pattern to see possible matches
              </Text>
            </View>
          ) : filteredWords.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No words found matching your criteria
              </Text>
            </View>
          ) : (
            <View style={styles.wordsGrid}>
              {filteredWords.map((word, index) => (
                <TouchableOpacity key={index} style={styles.wordCard}>
                  <Text style={styles.wordText}>{word.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  inputSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputGroupLast: {
    marginBottom: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  keyboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  inputContainer: {
    gap: 12,
  },
  patternInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: '#f9fafb',
    letterSpacing: 2,
  },
  patternDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  letterBox: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  letterBoxFilled: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  letterText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
  },
  keyboard: {
    gap: 6,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  keyboardKey: {
    minWidth: 32,
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 8,
  },
  excludedKey: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  includedKey: {
    backgroundColor: '#ecfdf5',
    borderColor: '#86efac',
  },
  lockedKey: {
    borderColor: '#22c55e',
    borderWidth: 3,
    opacity: 0.9,
  },
  keyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  excludedText: {
    color: '#dc2626',
  },
  includedText: {
    color: '#059669',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
    paddingTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    gap: 6,
  },
  clearButtonText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 14,
  },
  resultsHeader: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
    gap: 8,
    paddingTop: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  truncationWarning: {
    fontSize: 12,
    color: '#f59e0b',
    marginBottom: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordCard: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  wordText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
    letterSpacing: 1,
  },
});
