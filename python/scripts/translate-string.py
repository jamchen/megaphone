import sys
from translate import Translator

def translate_text(text, source_lang, target_lang):
  # Initialize the translator
  translator = Translator(from_lang=source_lang, to_lang=target_lang)
  translation = translator.translate(text)
  return translation

if __name__ == "__main__":
  if len(sys.argv) != 4:
    print("Usage: python translate.py <text> <source_lang> <target_lang>")
    sys.exit(1)

  text = sys.argv[1]
  source_lang = sys.argv[2]
  target_lang = sys.argv[3]

  translated_text = translate_text(text, source_lang, target_lang)
  print(f"{translated_text}")
