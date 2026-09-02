import spacy
import pypinyin
import pykakasi
from janome.tokenizer import Tokenizer
from konlpy.tag import Okt
from korean_romanizer.romanizer import Romanizer
from deep_translator import GoogleTranslator
from gruut import sentences
import os
if "JAVA_HOME" not in os.environ and os.path.exists(r"C:\Program Files\Java\jdk-25.0.2"):
    os.environ["JAVA_HOME"] = r"C:\Program Files\Java\jdk-25.0.2"


class LingoDictionary:
    def __init__(self):
        print("Đang khởi tạo các mô hình NLP (Chỉ chạy 1 lần khi Start Server)...")
        # 1. Nhóm Châu Âu (spaCy dùng để lấy từ gốc)
        self.nlp_en = spacy.load("en_core_web_sm")
        self.nlp_de = spacy.load("de_core_news_sm")
        self.nlp_fr = spacy.load("fr_core_news_sm")
        self.nlp_es = spacy.load("es_core_news_sm")
        
        # 2. Nhóm Á Đông
        self.janome_tokenizer = Tokenizer()     
        self.kakasi = pykakasi.kakasi()         
        self.okt = Okt()                        

    def _get_gruut_phonetic(self, text: str, lang: str) -> str:
        """Hàm dùng chung cho nhóm Châu Âu để lấy mã IPA từ gruut"""
        try:
            gruut_lang_map = {
                "en": "en-us",
                "de": "de-de",
                "fr": "fr-fr",
                "es": "es-es"
            }
            gruut_lang = gruut_lang_map.get(lang)
            if not gruut_lang:
                return ""
                
            phonemes = []
            for sent in sentences(text, lang=gruut_lang):
                for word in sent:
                    if word.phonemes:
                        phonemes.extend(word.phonemes)
                        
            ipa = "".join(phonemes)
            return f"/{ipa}/" if ipa else ""
        except Exception:
            return ""

    def get_word_info(self, word: str, lang_code: str, target_lang: str = "vi") -> dict:
        base_word = word
        phonetic = ""

        try:
            if lang_code == "en":
                base_word = self.nlp_en(word)[0].lemma_
                phonetic = self._get_gruut_phonetic(word, "en")
                
            elif lang_code == "de":
                base_word = self.nlp_de(word)[0].lemma_
                phonetic = self._get_gruut_phonetic(word, "de")
                
            elif lang_code == "fr":
                base_word = self.nlp_fr(word)[0].lemma_
                phonetic = self._get_gruut_phonetic(word, "fr")
                
            elif lang_code == "es":
                base_word = self.nlp_es(word)[0].lemma_
                phonetic = self._get_gruut_phonetic(word, "es")

            elif lang_code == "zh":
                base_word = word 
                pinyin_list = pypinyin.pinyin(word, style=pypinyin.Style.TONE)
                phonetic = "".join([item[0] for item in pinyin_list])
                
            elif lang_code == "ja":
                tokens = list(self.janome_tokenizer.tokenize(word))
                if tokens:
                    base_word = tokens[0].base_form
                    k_result = self.kakasi.convert(word)
                    phonetic = "".join([item['hepburn'] for item in k_result])
                    
            elif lang_code == "ko":
                pos_result = self.okt.pos(word, stem=True)
                if pos_result:
                    base_word = pos_result[0][0]
                    phonetic = Romanizer(word).romanize()

            translate_src = "zh-CN" if lang_code == "zh" else lang_code
            translate_dest = "zh-CN" if target_lang == "zh" else target_lang
            try:
                if translate_src == translate_dest:
                    meaning = base_word
                else:
                    meaning = GoogleTranslator(source=translate_src, target=translate_dest).translate(base_word)
                    meaning = meaning.lower() if meaning else base_word
            except Exception:
                meaning = base_word

            return {
                "source_lang": lang_code,
                "target_lang": target_lang,
                "original_word": word,
                "base_word": base_word,
                "phonetic": phonetic,
                "meaning": meaning
            }
            
        except Exception as e:
            return {
                "error": str(e), 
                "word": word, 
                "source_lang": lang_code, 
                "target_lang": target_lang
            }