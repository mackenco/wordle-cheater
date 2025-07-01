import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Info, Target, Lightbulb, HelpCircle } from 'lucide-react-native';

export default function About() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>About Wordle Solver</Text>
        <Text style={styles.subtitle}>Your ultimate Wordle companion</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color="#3b82f6" />
            <Text style={styles.sectionTitle}>What is Wordle?</Text>
          </View>
          <Text style={styles.sectionText}>
            Wordle is a popular word-guessing game where players have six attempts to figure out a hidden five-letter word. After each guess, you receive color-coded feedback:
          </Text>
          <View style={styles.feedbackList}>
            <View style={styles.feedbackItem}>
              <View style={[styles.feedbackBox, { backgroundColor: '#10b981' }]} />
              <Text style={styles.feedbackText}>Green: Letter is correct and in the right position</Text>
            </View>
            <View style={styles.feedbackItem}>
              <View style={[styles.feedbackBox, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.feedbackText}>Yellow: Letter is in the word but wrong position</Text>
            </View>
            <View style={styles.feedbackItem}>
              <View style={[styles.feedbackBox, { backgroundColor: '#6b7280' }]} />
              <Text style={styles.feedbackText}>Gray: Letter is not in the word</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Target size={20} color="#10b981" />
            <Text style={styles.sectionTitle}>How to Use This Solver</Text>
          </View>
          <View style={styles.stepsList}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Enter Word Pattern</Text>
                <Text style={styles.stepText}>
                  Use letters for known positions and ? for unknown ones. For example, if you know the second letter is 'O' and the last is 'Y', enter: ?o??y
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Add Excluded Letters</Text>
                <Text style={styles.stepText}>
                  Enter letters that you've tried and know are NOT in the word (gray letters from your Wordle attempts).
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Add Included Letters</Text>
                <Text style={styles.stepText}>
                  Enter letters that you know ARE in the word but you don't know their exact position (yellow letters).
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Get Results</Text>
                <Text style={styles.stepText}>
                  The solver will show you all possible words that match your criteria. Tap any word to copy it!
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lightbulb size={20} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Pro Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <Text style={styles.tip}>• Start with common vowels and consonants like ADIEU or AROSE</Text>
            <Text style={styles.tip}>• Use the solver after your second or third guess for best results</Text>
            <Text style={styles.tip}>• Pay attention to letter frequency - common letters are more likely</Text>
            <Text style={styles.tip}>• Consider word patterns and common endings like -ING, -ED, -ER</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <HelpCircle size={20} color="#8b5cf6" />
            <Text style={styles.sectionTitle}>Example</Text>
          </View>
          <View style={styles.example}>
            <Text style={styles.exampleTitle}>Let's say you've made these guesses:</Text>
            <View style={styles.exampleGuess}>
              <Text style={styles.exampleText}>ADIEU → A is yellow, D is gray, I is gray, E is green, U is gray</Text>
            </View>
            <View style={styles.exampleGuess}>
              <Text style={styles.exampleText}>STONE → S is gray, T is gray, O is gray, N is gray, E is green</Text>
            </View>
            <Text style={styles.exampleInstructions}>Enter in the solver:</Text>
            <View style={styles.exampleInputs}>
              <Text style={styles.exampleInput}>Pattern: ???e?</Text>
              <Text style={styles.exampleInput}>Excluded: diuston</Text>
              <Text style={styles.exampleInput}>Included: a</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This solver uses a comprehensive dictionary of valid 5-letter words to help you solve any Wordle puzzle. Good luck!
          </Text>
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  sectionText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  feedbackList: {
    marginTop: 12,
    gap: 8,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  feedbackBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  feedbackText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  stepsList: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  tipsList: {
    gap: 8,
  },
  tip: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  example: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  exampleGuess: {
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  exampleInstructions: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 8,
  },
  exampleInputs: {
    gap: 4,
  },
  exampleInput: {
    fontSize: 12,
    color: '#10b981',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});