import { describe, test, expect } from 'vitest';
import { safeJsonLdString } from './seo';

describe('safeJsonLdString', () => {
  test('escapes script-breaking characters', () => {
    const maliciousData = {
      title: 'Test</script><script>alert("XSS")</script>',
      description: 'Normal text',
    };
    
    const result = safeJsonLdString(maliciousData);
    
    // Should not contain unescaped < or > characters
    expect(result).not.toContain('</script>');
    expect(result).not.toContain('<script>');
    
    // Should contain escaped versions
    expect(result).toContain('\\u003c');
    expect(result).toContain('\\u003e');
  });

  test('handles normal data without issues', () => {
    const normalData = {
      title: 'My App',
      description: 'A useful tool for musicians',
      category: 'Education',
    };
    
    const result = safeJsonLdString(normalData);
    
    // Should be valid JSON when parsed
    expect(() => JSON.parse(result)).not.toThrow();
    
    // Should preserve data integrity
    const parsed = JSON.parse(result);
    expect(parsed.title).toBe('My App');
    expect(parsed.description).toBe('A useful tool for musicians');
    expect(parsed.category).toBe('Education');
  });

  test('escapes unicode line and paragraph separators', () => {
    const dataWithSeparators = {
      text: 'Line 1\u2028Line 2\u2029Paragraph',
    };
    
    const result = safeJsonLdString(dataWithSeparators);
    
    // Should escape unicode separators
    expect(result).toContain('\\u2028');
    expect(result).toContain('\\u2029');
  });

  test('handles nested objects and arrays', () => {
    const complexData = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Test App',
      offers: [
        { price: '0', priceCurrency: 'USD' },
        { price: '10', priceCurrency: 'EUR' },
      ],
      author: {
        '@type': 'Person',
        name: 'John Doe',
      },
    };
    
    const result = safeJsonLdString(complexData);
    
    // Should maintain structure
    const parsed = JSON.parse(result);
    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed.offers).toHaveLength(2);
    expect(parsed.author.name).toBe('John Doe');
  });

  test('prevents script tag injection in various positions', () => {
    const attackVectors = [
      { field: '</script><script>alert(1)</script>' },
      { field: '<script>alert(1)</script>' },
      { field: '<!--</script>--><script>alert(1)</script>' },
      { field: '</SCRIPT><SCRIPT>alert(1)</SCRIPT>' },
    ];
    
    attackVectors.forEach(vector => {
      const result = safeJsonLdString(vector);
      
      // None of these should contain unescaped script tags
      expect(result.toLowerCase()).not.toMatch(/<\/?script>/i);
    });
  });

  test('handles undefined data gracefully', () => {
    const result = safeJsonLdString(undefined);
    
    // Should return 'null' for undefined
    expect(result).toBe('null');
  });

  test('handles circular references without throwing', () => {
    // Create an object with a circular reference
    const circularData: any = { name: 'Test' };
    circularData.self = circularData;
    
    const result = safeJsonLdString(circularData);
    
    // Should return 'null' instead of throwing
    expect(result).toBe('null');
  });

  test('handles symbols and functions that JSON.stringify cannot serialize', () => {
    const dataWithUnserialized = {
      name: 'Test',
      symbol: Symbol('test'),
      func: () => console.log('test'),
    };
    
    const result = safeJsonLdString(dataWithUnserialized);
    
    // Should successfully serialize (symbols and functions are omitted by JSON.stringify)
    expect(result).not.toBe('null');
    const parsed = JSON.parse(result);
    expect(parsed.name).toBe('Test');
    expect(parsed.symbol).toBeUndefined();
    expect(parsed.func).toBeUndefined();
  });
});
