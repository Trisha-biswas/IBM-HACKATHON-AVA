# AI-Based Content Sanitization

## Overview

The Agentic VISA Assistant System now includes an intelligent content sanitization feature powered by IBM watsonx.ai. Instead of using code-based regex patterns, the system leverages the LLM's understanding to clean and refine generated documents.

## Architecture

### 1. Sanitization Tool Definition

**Location**: `backend/services/watsonxService.js`

```javascript
{
  type: 'function',
  function: {
    name: 'sanitize_content',
    description: 'Clean and sanitize generated content by removing repetitions, duplicates, hashtags, and unwanted patterns.',
    parameters: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'The raw content to be sanitized'
        },
        documentType: {
          type: 'string',
          enum: ['cover_letter', 'itinerary'],
          description: 'Type of document being sanitized'
        }
      },
      required: ['content', 'documentType']
    }
  }
}
```

### 2. Sanitization Prompt

**Location**: `backend/utils/prompts.js`

The `generateSanitizationPrompt()` function creates a comprehensive cleaning instruction set for the LLM:

#### Cleaning Requirements

**Universal Removals:**
- Hashtags (e.g., #travel, #visa)
- Markdown formatting symbols (##, **, *, __, _)
- HTML tags (<div>, <p>, etc.)
- Duplicate consecutive lines or paragraphs
- Repeated sections or day headers
- Meta-commentary phrases
- Self-referential text about the document
- Explanations about the generation process
- Apologies or unnecessary clarifications
- Trailing artifacts (page numbers, footers)
- Excessive whitespace

**Cover Letter Specific:**
- Keep only ONE salutation
- Keep only ONE closing
- Remove duplicate paragraphs with similar content
- Ensure proper business letter structure

**Itinerary Specific:**
- Ensure each day appears EXACTLY ONCE
- Remove duplicate day headers
- Remove duplicate activity descriptions
- Ensure chronological order
- Remove any text after the last day
- Keep flight information in Day 1 only

#### Preservation Rules

The sanitizer preserves:
- All factual information (names, dates, flight details, locations)
- Professional tone and formal language
- Proper structure and formatting
- Essential content for visa application
- Bullet points and time indicators
- Day headers in correct format

### 3. Orchestration Integration

**Location**: `backend/services/watsonxService.js` - `orchestrateWithTools()` function

The sanitization is integrated into the document generation workflow:

```
Step 1: Search flights (if needed)
Step 2: Generate cover letter
Step 2.5: Sanitize cover letter ← NEW
Step 3: Generate itinerary
Step 3.5: Sanitize itinerary ← NEW
Step 4: Return clean documents
```

### 4. Tool Execution

**Location**: `backend/services/watsonxService.js` - `executeTool()` function

```javascript
case 'sanitize_content':
  console.log(`   🧹 Sanitizing ${args.documentType} content...`);
  const sanitizationPrompt = generateSanitizationPrompt(args.content, args.documentType);
  
  const sanitizedResult = await callWatsonxWithTools(sanitizationPrompt, [], {
    max_new_tokens: 2000,
    temperature: 0.3,      // Lower for consistency
    top_p: 0.85,
    repetition_penalty: 1.2
  });
  
  return {
    success: true,
    data: {
      cleanedContent: sanitizedResult.text,
      originalLength: args.content.length,
      cleanedLength: sanitizedResult.text.length
    }
  };
```

## Model Parameters

The sanitization uses optimized parameters for consistent cleaning:

- **max_new_tokens**: 2000 (allows for full document)
- **temperature**: 0.3 (lower than generation for consistency)
- **top_p**: 0.85 (focused sampling)
- **repetition_penalty**: 1.2 (prevents repetitive cleaning)

## Benefits of AI-Based Approach

### 1. **Intelligent Context Understanding**
- LLM understands semantic meaning, not just patterns
- Can distinguish between legitimate repetition and unwanted duplication
- Preserves important repeated information (e.g., traveler name in different contexts)

### 2. **Adaptive Cleaning**
- Handles various types of unwanted content without predefined rules
- Adapts to different writing styles and formats
- Can handle edge cases that regex patterns might miss

### 3. **Quality Preservation**
- Maintains professional tone and formal language
- Preserves factual accuracy and essential information
- Keeps document structure intact

### 4. **No Maintenance Overhead**
- No need to update regex patterns for new issues
- No hardcoded rules to maintain
- Self-improving as the LLM model improves

### 5. **Consistent Results**
- Lower temperature ensures reliable cleaning
- Deterministic behavior for similar inputs
- Predictable output quality

## Usage Example

### Before Sanitization (Raw Output)

```
## Travel Itinerary for John Doe

Travel Itinerary for John Doe
Destination: France
Duration: 14 days

Day 1 - 2026-07-01
#travel #france
* Morning: Arrive at Paris Charles de Gaulle Airport
* Morning: Arrive at Paris Charles de Gaulle Airport
* Afternoon: Check into hotel
* Evening: Explore local area

Day 1 - 2026-07-01
* Morning: Arrive at Paris Charles de Gaulle Airport
...
```

### After Sanitization (Clean Output)

```
Travel Itinerary for John Doe
Destination: France
Duration: 14 days

Day 1 - 2026-07-01
* Morning: Arrive at Paris Charles de Gaulle Airport
* Afternoon: Check into hotel
* Evening: Explore local area
...
```

## Console Output

When sanitization runs, you'll see:

```
🧹 Sanitizing cover_letter content...
   ✓ Content sanitized successfully
   Summary: Sanitized cover_letter: 1523 → 1342 characters

🧹 Sanitizing itinerary content...
   ✓ Content sanitized successfully
   Summary: Sanitized itinerary: 2847 → 2456 characters
```

## Testing

### Manual Testing

```bash
cd backend
node test-multi-agent.js
```

Watch for sanitization logs in the console output.

### Verification Checklist

- [ ] No hashtags in generated PDFs
- [ ] No markdown symbols (##, **, *)
- [ ] No duplicate day headers in itineraries
- [ ] No duplicate paragraphs in cover letters
- [ ] No meta-commentary or explanations
- [ ] Single salutation and closing in cover letters
- [ ] Proper chronological order in itineraries
- [ ] All factual information preserved
- [ ] Professional tone maintained

## Error Handling

If sanitization fails, the system falls back to the raw content:

```javascript
coverLetterText = coverLetterSanitized.success 
  ? coverLetterSanitized.data.cleanedContent 
  : rawCoverLetter;
```

This ensures documents are always generated, even if sanitization encounters issues.

## Performance Considerations

### API Calls
- Adds 2 additional watsonx.ai API calls per request (one for cover letter, one for itinerary)
- Each sanitization call takes ~2-5 seconds
- Total overhead: ~4-10 seconds per complete package generation

### Token Usage
- Sanitization uses up to 2000 tokens per document
- Input tokens: ~500-1500 (raw content)
- Output tokens: ~400-1200 (cleaned content)
- Total: ~4000-6000 tokens per complete package

### Cost Impact
- Approximately 2x the API calls compared to non-sanitized generation
- Still cost-effective given the quality improvement
- Consider caching for identical requests (future enhancement)

## Future Enhancements

### 1. Selective Sanitization
- Add option to skip sanitization for trusted content
- Allow users to choose sanitization level (light/medium/aggressive)

### 2. Sanitization Metrics
- Track common issues removed
- Generate quality reports
- A/B testing for prompt optimization

### 3. Caching
- Cache sanitized content for identical raw inputs
- Reduce API calls for similar documents
- Implement Redis or in-memory cache

### 4. Batch Sanitization
- Sanitize multiple documents in a single API call
- Reduce latency for multi-traveler requests
- Optimize token usage

### 5. Custom Rules
- Allow users to specify additional cleaning rules
- Domain-specific sanitization (e.g., medical, business)
- Template-based cleaning

## Troubleshooting

### Issue: Sanitization removes important content

**Solution**: Update the sanitization prompt to be more specific about what to preserve. Add examples of content that should NOT be removed.

### Issue: Sanitization is too slow

**Solution**: 
1. Reduce `max_new_tokens` if documents are consistently shorter
2. Implement caching for repeated content
3. Consider parallel sanitization for cover letter and itinerary

### Issue: Inconsistent cleaning results

**Solution**:
1. Lower the temperature further (try 0.2 or 0.1)
2. Add more explicit examples in the prompt
3. Increase `repetition_penalty` to prevent repetitive patterns

### Issue: Sanitization fails frequently

**Solution**:
1. Check watsonx.ai API status
2. Verify token limits aren't exceeded
3. Add retry logic with exponential backoff
4. Ensure fallback to raw content is working

## Related Files

- `backend/services/watsonxService.js` - Tool definition and execution
- `backend/utils/prompts.js` - Sanitization prompt generation
- `backend/services/fileService.js` - PDF generation (uses sanitized content)
- `backend/routes/visa.js` - API endpoints (calls orchestrator)

## API Documentation

### Internal Function: `executeTool('sanitize_content', args)`

**Parameters:**
```javascript
{
  content: string,      // Raw content to sanitize
  documentType: string  // 'cover_letter' or 'itinerary'
}
```

**Returns:**
```javascript
{
  success: boolean,
  data: {
    cleanedContent: string,
    originalLength: number,
    cleanedLength: number
  },
  summary: string
}
```

## Conclusion

The AI-based content sanitization feature provides intelligent, adaptive cleaning of generated documents without the maintenance overhead of code-based approaches. By leveraging watsonx.ai's language understanding, the system ensures high-quality, professional documents suitable for visa applications.

---

**Last Updated**: 2026-05-16  
**Version**: 1.0.0  
**Status**: Production Ready