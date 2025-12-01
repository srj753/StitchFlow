import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { AiService } from '@/lib/aiService';
import { extractPatternData } from '@/lib/patternExtractor';
import { extractTextFromFile, readFileAsBase64 } from '@/lib/pdfExtractor';
import { scrapeUrl } from '@/lib/webScraper';
import { usePatternStore } from '@/store/usePatternStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { PatternDifficulty } from '@/types/pattern';

const difficultyOptions: PatternDifficulty[] = ['beginner', 'intermediate', 'advanced'];

export default function ImportPatternScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const addPattern = usePatternStore((state) => state.addPattern);
  
  // Settings for AI
  const { openaiApiKey, aiAssistantEnabled, aiProvider } = useSettingsStore();

  const [name, setName] = useState('');
  const [designer, setDesigner] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<PatternDifficulty>('beginner');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [yarnWeight, setYarnWeight] = useState('');
  const [hookSize, setHookSize] = useState('');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState<string | undefined>();
  const [fileUri, setFileUri] = useState<string | undefined>();
  const [extractedText, setExtractedText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState<number>(0);
  const [error, setError] = useState<string | undefined>();
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const processWithAi = async (content: string, isImage: boolean = false) => {
    if (!openaiApiKey) return false;

    try {
      setExtractionProgress(0.5); // AI Processing start
      const aiService = new AiService({ apiKey: openaiApiKey, provider: aiProvider });
      
      let data;
      if (isImage) {
        data = await aiService.parsePatternFromImage(content); // content is base64
      } else {
        data = await aiService.parsePatternFromText(content); // content is text
      }

      // Handle new structured format from detailed parser
      // Format: { metadata: {...}, description, materials: {...}, gauge, abbreviations, instructions: [...] }
      const metadata = data.metadata || data;
      const materials = data.materials || { yarn: [], tools: [] };
      const instructions = data.instructions || data.sections || [];

      // Map metadata to form fields
      if (metadata.name || data.name) setName(metadata.name || data.name);
      if (metadata.designer || data.designer) setDesigner(metadata.designer || data.designer);
      if (data.description) setDescription(data.description);
      if (metadata.difficulty || data.difficulty) {
        const difficulty = (metadata.difficulty || data.difficulty).toLowerCase();
        if (['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
          setDifficulty(difficulty as PatternDifficulty);
        }
      }
      if (metadata.yarnWeight || data.yarnWeight) setYarnWeight(metadata.yarnWeight || data.yarnWeight);
      if (metadata.hookSize || data.hookSize) setHookSize(metadata.hookSize || data.hookSize);
      if (data.notes) setNotes(data.notes);
      
      // Reconstruct structured pattern text for snippet
      // Format: Header, Materials, Gauge, Abbreviations, Instructions
      let niceSnippet = '';
      
      // Header
      if (metadata.name || data.name) {
        niceSnippet += `${metadata.name || data.name}\n`;
      }
      if (metadata.designer || data.designer) {
        niceSnippet += `By ${metadata.designer || data.designer}\n`;
      }
      if (data.description) {
        niceSnippet += `\n${data.description}\n`;
      }
      
      // Materials
      if (materials.yarn && materials.yarn.length > 0) {
        niceSnippet += `\nMaterials:\n`;
        materials.yarn.forEach((yarn: string) => {
          niceSnippet += `- ${yarn}\n`;
        });
      }
      if (materials.tools && materials.tools.length > 0) {
        materials.tools.forEach((tool: string) => {
          niceSnippet += `- ${tool}\n`;
        });
      }
      
      // Gauge
      if (data.gauge) {
        niceSnippet += `\nGauge: ${data.gauge}\n`;
      }
      
      // Abbreviations
      if (data.abbreviations && data.abbreviations.length > 0) {
        niceSnippet += `\nAbbreviations:\n`;
        data.abbreviations.forEach((abbr: string) => {
          niceSnippet += `${abbr}\n`;
        });
      }
      
      // Instructions
      if (instructions.length > 0) {
        niceSnippet += `\nInstructions:\n`;
        instructions.forEach((section: any) => {
          const sectionName = section.section_name || section.name || 'Main Pattern';
          niceSnippet += `\n${sectionName}\n`;
          
          const steps = section.steps || section.rows || [];
          steps.forEach((step: any) => {
            const rowLabel = step.row_label || step.label || '';
            const instruction = step.instruction || '';
            const stitchCount = step.stitch_count || step.stitchCount || '';
            
            niceSnippet += `${rowLabel}: ${instruction}`;
            if (stitchCount) {
              niceSnippet += ` (${stitchCount})`;
            }
            niceSnippet += '\n';
          });
        });
      }
      
      setExtractedText(niceSnippet.trim());
      setExtractionProgress(1);
      showSuccess('AI Successfully parsed the pattern!');
      return true;

    } catch (err: any) {
      console.error('AI Parse Error:', err);
      // Show more detailed error for debugging
      const errorMsg = err.message || 'Unknown error';
      showError(`AI parsing failed: ${errorMsg}`);
      return false;
    }
  };

  const processExtractedContent = async (text: string, title?: string, sourceUrl?: string, isBase64Image: boolean = false) => {
    // Priority: AI first if enabled and key exists
    if (aiAssistantEnabled && openaiApiKey) {
      const success = await processWithAi(text, isBase64Image);
      if (success) return true;
      
      // If AI fails, notify user we are falling back
      showError('AI Parsing failed. Falling back to standard extraction.');
    }

    // Fallback to standard regex extraction
    setExtractedText(text);
    
    if (text.trim().length > 0) {
      // Auto-extract pattern data
      const extracted = extractPatternData(text);
      
      // Auto-populate fields (only if they're empty)
      if (extracted.name && !name) setName(extracted.name);
      if (title && !name) setName(title); // Prefer title from metadata if available
      if (extracted.designer && !designer) setDesigner(extracted.designer);
      if (extracted.description && !description) setDescription(extracted.description);
      if (extracted.difficulty && difficulty === 'beginner') setDifficulty(extracted.difficulty);
      if (extracted.yarnWeight && !yarnWeight) setYarnWeight(extracted.yarnWeight);
      if (extracted.hookSize && !hookSize) setHookSize(extracted.hookSize);
      if (extracted.notes && !notes) setNotes(extracted.notes);
      
      return true;
    }
    return false;
  };

  const handleScrapeUrl = async () => {
    if (!referenceUrl) return;
    
    try {
      setIsScraping(true);
      setExtractionProgress(0);
      
      // Use our unified scraper
      const result = await scrapeUrl(referenceUrl, (status) => {
        // Simple progress simulation or status update
        if (status.includes('Fetching')) setExtractionProgress(0.2);
        else if (status.includes('Parsing') || status.includes('Processing')) setExtractionProgress(0.5);
        else if (status.includes('Scanning')) setExtractionProgress(0.7);
      });
      
      const success = await processExtractedContent(result.text, result.title, referenceUrl);
      
      if (success) {
        showSuccess(`Imported content from ${referenceUrl}`);
      } else {
        showError('Could not extract readable text from this URL.');
      }
      
      setExtractionProgress(1);
    } catch (err) {
      console.error('Scraping failed:', err);
      showError('Failed to import from URL. The site might be blocking access.');
    } finally {
      setIsScraping(false);
    }
  };

  const handlePickImages = async () => {
    try {
      setIsLoadingFile(true);
      setIsExtracting(true);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        base64: true, // Request base64 directly
      });

      if (!result.canceled && result.assets.length > 0) {
        setFileName(`${result.assets.length} images selected`);
        
        // If AI is enabled, process images with AI
        if (aiAssistantEnabled && openaiApiKey) {
          let processedCount = 0;
          let lastSuccessfulData: any = null;
          
          // Process first image (most important) - this will populate the form
          const firstAsset = result.assets[0];
          const base64 = firstAsset.base64 || await readFileAsBase64(firstAsset.uri);
          const success = await processWithAi(base64, true);
          
          if (success) {
            processedCount++;
            lastSuccessfulData = { base64, uri: firstAsset.uri };
          }
          
          // Process remaining images if any (for multi-page patterns)
          // Note: Currently we only use the first image's data, but we could combine them
          for (let i = 1; i < result.assets.length; i++) {
            const asset = result.assets[i];
            const assetBase64 = asset.base64 || await readFileAsBase64(asset.uri);
            // Process but don't overwrite form (just for progress tracking)
            try {
              const aiService = new AiService({ apiKey: openaiApiKey, provider: aiProvider });
              await aiService.parsePatternFromImage(assetBase64);
              processedCount++;
            } catch (err) {
              console.log(`Failed to process image ${i + 1}:`, err);
            }
            setExtractionProgress((i + 1) / result.assets.length);
          }
          
          if (processedCount > 0) {
            showSuccess(`Processed ${processedCount} of ${result.assets.length} images`);
          }
        } else {
          setFileUri(result.assets[0].uri); // Just keep reference to first one
          // Extract text from first image using OCR if available
          const firstAsset = result.assets[0];
          const text = await extractTextFromFile(firstAsset.uri, firstAsset.mimeType);
          await processExtractedContent(text, undefined, firstAsset.uri, false);
        }
      }
    } catch (error) {
      showError('Failed to pick images');
      console.error(error);
    } finally {
      setIsLoadingFile(false);
      setIsExtracting(false);
    }
  };

  const handlePickDocument = async () => {
    try {
      setIsLoadingFile(true);
      setIsExtracting(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (!result.canceled && result.assets?.length) {
        const doc = result.assets[0];
        setFileUri(doc.uri);
        setFileName(doc.name);
        
        // Use scrapeUrl for local files too (it handles file:// URIs)
        // For PDFs on native, scrapeUrl calls extractTextFromFile which returns empty string
        // We need to detect if it's a PDF on native and read as Base64 for AI
        const isPDF = doc.mimeType === 'application/pdf' || doc.name.toLowerCase().endsWith('.pdf');
        
        let textContent = '';
        let isBase64 = false;

        // Special handling for Native PDFs if using AI
        if (aiAssistantEnabled && isPDF && Platform.OS !== 'web') {
           // On native, read PDF as Base64 for AI vision/analysis since we can't parse text locally
           textContent = await readFileAsBase64(doc.uri);
           isBase64 = true;
        } else {
           // Only scrape if we haven't already read it as base64
           const scrapeResult = await scrapeUrl(doc.uri, (status) => {
              if (status.includes('Processing')) setExtractionProgress(0.5);
           });
           textContent = scrapeResult.text;
        }
        
        const success = await processExtractedContent(textContent, undefined, doc.uri, isBase64);
        
        if (success) {
          showSuccess(`Extracted content from file`);
        } else {
           showSuccess('File attached (text extraction not available)');
        }
      }
    } catch (error) {
      showError('Failed to pick or process file');
      console.error(error);
    } finally {
      setIsLoadingFile(false);
      setIsExtracting(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('A pattern name is required.');
      return;
    }
    if (!description.trim()) {
      setError('Add a short description so the card looks helpful.');
      return;
    }
    if (!referenceUrl.trim() && !fileUri) {
      setError('Provide either a reference link or attach a PDF.');
      return;
    }
    setError(undefined);

    try {
      setIsSubmitting(true);
      addPattern({
        name,
        designer,
        description,
        difficulty,
        referenceUrl: referenceUrl.trim() || undefined,
        fileUri,
        snippet: extractedText || undefined, // Store extracted pattern text
        yarnWeight,
        hookSize,
        notes,
        tags: [],
        moods: [],
      });
      showSuccess('Pattern saved to library');
      router.replace('/patterns');
    } catch (error) {
      showError('Failed to save pattern');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: theme.colors.muted }]}>Patterns</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Import pattern</Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          Upload a PDF, image (JPG/PNG), or text file.
          {aiAssistantEnabled 
            ? " AI Parsing is enabled for smarter results." 
            : " Enable 'AI Assistant' in settings for smarter parsing."}
        </Text>
      </View>

      <Card title="Details" subtitle="Basic metadata">
        <Field
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g., Cozy Ripple Throw"
          theme={theme}
          required
        />
        <Field
          label="Designer"
          value={designer}
          onChangeText={setDesigner}
          placeholder="Optional"
          theme={theme}
        />
        <Field
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Short summary of the pattern"
          theme={theme}
          multiline
          required
        />
        <View style={styles.difficultyRow}>
          {difficultyOptions.map((option) => {
            const selected = option === difficulty;
            return (
              <TouchableOpacity
                key={option}
                onPress={() => setDifficulty(option)}
                style={[
                  styles.diffChip,
                  {
                    borderColor: selected ? theme.colors.accent : theme.colors.border,
                    backgroundColor: selected ? theme.colors.accentMuted : theme.colors.surfaceAlt,
                  },
                ]}>
                <Text
                  style={{
                    color: selected ? theme.colors.accent : theme.colors.textSecondary,
                  }}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <Card title="Sources" subtitle="Link or attach the original">
        <View style={styles.urlRow}>
          <View style={{ flex: 1 }}>
            <Field
              label="Reference URL"
              value={referenceUrl}
              onChangeText={setReferenceUrl}
              placeholder="https://example.com/pattern"
              theme={theme}
            />
          </View>
          <TouchableOpacity
            onPress={handleScrapeUrl}
            disabled={isScraping || !referenceUrl}
            style={[
              styles.scrapeButton,
              { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border },
              (isScraping || !referenceUrl) && { opacity: 0.5 }
            ]}>
            {isScraping ? (
              <LoadingSpinner size="small" />
            ) : (
              <Text style={{ color: theme.colors.accent, fontWeight: '600' }}>Fetch</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          <TouchableOpacity
            onPress={handlePickImages}
            disabled={isLoadingFile || isExtracting || isScraping}
            style={[
              styles.fileButton,
              { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt, flex: 1 },
              (isLoadingFile || isExtracting || isScraping) && { opacity: 0.6 },
            ]}>
            <Text style={{ color: theme.colors.text, textAlign: 'center', fontWeight: '600' }}>
              Pick Images
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handlePickDocument}
            disabled={isLoadingFile || isExtracting || isScraping}
            style={[
              styles.fileButton,
              { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt, flex: 1 },
              (isLoadingFile || isExtracting || isScraping) && { opacity: 0.6 },
            ]}>
            <Text style={{ color: theme.colors.text, textAlign: 'center', fontWeight: '600' }}>
              Pick PDF
            </Text>
          </TouchableOpacity>
        </View>

        {(isLoadingFile || isExtracting || isScraping) && (
            <View style={[styles.loadingContainer, { marginTop: 16 }]}>
              <LoadingSpinner size="small" />
              <View style={styles.loadingTextContainer}>
                <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                  {isScraping ? 'Fetching webpage...' : 
                   (isExtracting 
                    ? extractionProgress > 0 
                      ? `Extracting... ${Math.round(extractionProgress * 100)}%`
                      : 'Extracting pattern...'
                    : 'Loading file...')}
                </Text>
                {extractionProgress > 0 && (
                  <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${extractionProgress * 100}%`,
                          backgroundColor: theme.colors.accent,
                        }
                      ]} 
                    />
                  </View>
                )}
              </View>
            </View>
        )}

        {!isLoadingFile && fileName && (
           <Text style={{ color: theme.colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
              Attached: {fileName}
           </Text>
        )}
        {extractedText && (
          <View style={[styles.extractedPreview, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Text style={[styles.extractedLabel, { color: theme.colors.textSecondary }]}>
              ✓ Content extracted ({extractedText.length} chars)
            </Text>
            <Text style={[styles.extractedText, { color: theme.colors.text }]} numberOfLines={3}>
              {extractedText.substring(0, 200)}...
            </Text>
          </View>
        )}
      </Card>

      <Card title="Specs" subtitle="Optional helpers for filtering">
        <Field
          label="Yarn weight"
          value={yarnWeight}
          onChangeText={setYarnWeight}
          placeholder="Worsted, DK..."
          theme={theme}
        />
        <Field
          label="Hook size"
          value={hookSize}
          onChangeText={setHookSize}
          placeholder="4.0 mm"
          theme={theme}
        />
        <Field
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Yarn substitutions, reminders..."
          theme={theme}
          multiline
        />
      </Card>

      {error ? <Text style={{ color: theme.colors.accent }}>{error}</Text> : null}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isSubmitting}
        style={[
          styles.submitButton,
          { backgroundColor: theme.colors.accent },
          isSubmitting && { opacity: 0.6 },
        ]}>
        {isSubmitting ? (
          <LoadingSpinner size="small" color="#000" />
        ) : (
          <Text style={styles.submitButtonText}>Save to library</Text>
        )}
      </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  theme,
  required,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  theme: ReturnType<typeof useTheme>;
  required?: boolean;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.colors.muted }]}>
        {label}
        {required ? ' *' : ''}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.muted}
        multiline={multiline}
        style={[
          styles.input,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surfaceAlt,
            color: theme.colors.text,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
    gap: 8,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  field: {
    marginBottom: 12,
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  diffChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  scrapeButton: {
    height: 44,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  fileButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#07080c',
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingTextContainer: {
    flex: 1,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  extractedPreview: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  extractedLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  extractedText: {
    fontSize: 14,
    lineHeight: 20,
  },
  aiToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  aiTitle: {
    fontWeight: '700',
    fontSize: 14,
  },
  aiDesc: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    padding: 24,
    borderRadius: 16,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});


