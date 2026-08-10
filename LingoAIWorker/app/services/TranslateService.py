import os
import time
import json
import math
import logging
import gc
import torch
from dotenv import load_dotenv
from deep_translator import GoogleTranslator
from google import genai
from google.genai import types
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

load_dotenv()
_gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger(__name__)

WHISPER_TO_NLLB = {
    "en": "eng_Latn",   # Tiếng Anh
    "vi": "vie_Latn",   # Tiếng Việt
    "ja": "jpn_Jpan",   # Tiếng Nhật
    "ko": "kor_Hang",   # Tiếng Hàn
    "zh": "zho_Hans",   # Tiếng Trung (Giản thể)
    "yue": "yue_Hant",  # Tiếng Quảng Đông (Phồn thể)
    "fr": "fra_Latn",   # Tiếng Pháp
    "de": "deu_Latn",   # Tiếng Đức
    "es": "spa_Latn",   # Tiếng Tây Ban Nha
    "ru": "rus_Cyrl",   # Tiếng Nga
    "it": "ita_Latn",   # Tiếng Ý
    "pt": "por_Latn",   # Tiếng Bồ Đào Nha
    "pl": "pol_Latn",   # Tiếng Ba Lan
    "nl": "nld_Latn",   # Tiếng Hà Lan
    "sv": "swe_Latn",   # Tiếng Thụy Điển
    "fi": "fin_Latn",   # Tiếng Phần Lan
    "da": "dan_Latn",   # Tiếng Đan Mạch
    "no": "nob_Latn",   # Tiếng Na Uy (Bokmål)
    "nn": "nno_Latn",   # Tiếng Na Uy (Nynorsk)
    "cs": "ces_Latn",   # Tiếng Séc
    "sk": "slk_Latn",   # Tiếng Slovak
    "ro": "ron_Latn",   # Tiếng Romania
    "bg": "bul_Cyrl",   # Tiếng Bulgaria
    "hu": "hun_Latn",   # Tiếng Hungary
    "el": "ell_Grek",   # Tiếng Hy Lạp
    "uk": "ukr_Cyrl",   # Tiếng Ukraina
    "be": "bel_Cyrl",   # Tiếng Belarus
    "hr": "hrv_Latn",   # Tiếng Croatia
    "sr": "srp_Cyrl",   # Tiếng Serbia
    "sl": "slv_Latn",   # Tiếng Slovenia
    "bs": "bos_Latn",   # Tiếng Bosnia
    "mk": "mkd_Cyrl",   # Tiếng Macedonia
    "sq": "als_Latn",   # Tiếng Albania 
    "lt": "lit_Latn",   # Tiếng Litva
    "lv": "lav_Latn",   # Tiếng Latvia
    "et": "est_Latn",   # Tiếng Estonia
    "is": "isl_Latn",   # Tiếng Iceland
    "ga": "gle_Latn",   # Tiếng Ireland
    "cy": "cym_Latn",   # Tiếng Wales
    "mt": "mlt_Latn",   # Tiếng Malta
    "ca": "cat_Latn",   # Tiếng Catalan
    "gl": "glg_Latn",   # Tiếng Galician
    "eu": "eus_Latn",   # Tiếng Basque
    "br": "bre_Latn",   # Tiếng Breton
    "fo": "fao_Latn",   # Tiếng Faroe
    "lb": "ltz_Latn",   # Tiếng Luxembourg
    "th": "tha_Thai",   # Tiếng Thái
    "id": "ind_Latn",   # Tiếng Indonesia
    "ms": "zsm_Latn",   # Tiếng Mã Lai
    "tl": "tgl_Latn",   # Tiếng Tagalog / Philippines
    "km": "khm_Khmr",   # Tiếng Khmer
    "lo": "lao_Laoo",   # Tiếng Lào
    "my": "mya_Mymr",   # Tiếng Myanmar (Miến Điện)
    "hi": "hin_Deva",   # Tiếng Hindi
    "ur": "urd_Arab",   # Tiếng Urdu
    "bn": "ben_Beng",   # Tiếng Bengal
    "pa": "pan_Guru",   # Tiếng Punjab
    "ta": "tam_Taml",   # Tiếng Tamil
    "te": "tel_Telu",   # Tiếng Telugu
    "mr": "mar_Deva",   # Tiếng Marathi
    "gu": "guj_Gujr",   # Tiếng Gujarat
    "kn": "kan_Knda",   # Tiếng Kannada
    "ml": "mal_Mlym",   # Tiếng Malayalam
    "si": "sin_Sinh",   # Tiếng Sinhala
    "ne": "npi_Deva",   # Tiếng Nepal
    "sa": "san_Deva",   # Tiếng Phạn (Sanskrit)
    "sd": "snd_Arab",   # Tiếng Sindhi
    "as": "asm_Beng",   # Tiếng Assam
    "jw": "jav_Latn",   # Tiếng Java
    "su": "sun_Latn",   # Tiếng Sunda
    "mn": "khk_Cyrl",   # Tiếng Mông Cổ
    "bo": "bod_Tibt",   # Tiếng Tây Tạng
    "mi": "mri_Latn",   # Tiếng Maori
    "haw": "haw_Latn",  # Tiếng Hawaii
    "ar": "arb_Arab",   # Tiếng Ả Rập (Modern Standard)
    "he": "heb_Hebr",   # Tiếng Do Thái
    "fa": "pes_Arab",   # Tiếng Ba Tư (Persian/Farsi)
    "tr": "tur_Latn",   # Tiếng Thổ Nhĩ Kỳ
    "az": "aze_Latn",   # Tiếng Azerbaijan
    "kk": "kaz_Cyrl",   # Tiếng Kazakhstan
    "uz": "uzn_Latn",   # Tiếng Uzbekistan
    "tg": "tgk_Cyrl",   # Tiếng Tajikistan
    "tk": "tuk_Latn",   # Tiếng Turkmenistan
    "ky": "kir_Cyrl",   # Tiếng Kyrgyzstan
    "ps": "pbt_Arab",   # Tiếng Pashto
    "hy": "hye_Armn",   # Tiếng Armenia
    "ka": "kat_Geor",   # Tiếng Gruzia (Georgia)
    "tt": "tat_Cyrl",   # Tiếng Tatar
    "ba": "bak_Cyrl",   # Tiếng Bashkir
    "yi": "ydd_Hebr",   # Tiếng Yiddish
    "sw": "swh_Latn",   # Tiếng Swahili
    "am": "amh_Ethi",   # Tiếng Amharic
    "yo": "yor_Latn",   # Tiếng Yoruba
    "ig": "ibo_Latn",   # Tiếng Igbo
    "ha": "hau_Latn",   # Tiếng Hausa
    "zu": "zul_Latn",   # Tiếng Zulu
    "xh": "xho_Latn",   # Tiếng Xhosa
    "sn": "sna_Latn",   # Tiếng Shona
    "so": "som_Latn",   # Tiếng Somali
    "af": "afr_Latn",   # Tiếng Afrikaans
    "mg": "mlg_Latn",   # Tiếng Malagasy
    "ln": "lin_Latn",   # Tiếng Lingala
    "ht": "hat_Latn",   # Tiếng Creole Haiti
    "la": "lat_Latn",   # Tiếng Latinh
    "oc": "oci_Latn"    # Tiếng Occitan
}

def get_nllb_lang_code(whisper_lang_code: str, default_lang: str = "eng_Latn") -> str:
    return WHISPER_TO_NLLB.get(whisper_lang_code, default_lang)

def calculate_optimal_batch_size(
    total_items: int,
    target_batches: int = 4,
    min_batch_size: int = 25,
    max_batch_size: int = 250
) -> int:
    if total_items <= 0:
        return min_batch_size
    
    calculated = math.ceil(total_items / target_batches)
    return max(min_batch_size, min(calculated, max_batch_size))


def chunk_list(lst: list, batch_size: int):
    for i in range(0, len(lst), batch_size):
        yield lst[i : i + batch_size]


NLLB_MODEL_NAME = "facebook/nllb-200-distilled-1.3B"
_nllb_tokenizer = None
_nllb_model = None

def _get_nllb_model():
    global _nllb_tokenizer, _nllb_model
    if _nllb_model is None or _nllb_tokenizer is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"[NLLB] Loading {NLLB_MODEL_NAME} lên {device} (torch.float16)...")
        _nllb_tokenizer = AutoTokenizer.from_pretrained(NLLB_MODEL_NAME)
        _nllb_model = AutoModelForSeq2SeqLM.from_pretrained(
            NLLB_MODEL_NAME,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            device_map="auto" if device == "cuda" else None
        )
        if device != "cuda":
            _nllb_model.to(device)
    return _nllb_tokenizer, _nllb_model


def unload_nllb_model():
    global _nllb_tokenizer, _nllb_model
    if _nllb_model is not None:
        del _nllb_model
        del _nllb_tokenizer
        _nllb_model = None
        _nllb_tokenizer = None
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        logger.info("[NLLB] Đã giải phóng model khỏi VRAM.")


def translateUsingNLLB(data: list, src_lang: str = "en", tgt_lang: str = "vi", batch_size: int = 16) -> list:
    if src_lang == tgt_lang:
        for item in data:
            item["translated"] = item["text"]
        return data

    nllb_src = get_nllb_lang_code(src_lang, "eng_Latn")
    nllb_tgt = get_nllb_lang_code(tgt_lang, "vie_Latn")
    total = len(data)
    logger.info(f"[NLLB] Bắt đầu dịch {total} dòng ({nllb_src} -> {nllb_tgt}) với batch_size={batch_size}")

    tokenizer, model = _get_nllb_model()
    device = "cuda" if torch.cuda.is_available() else "cpu"
    tokenizer.src_lang = nllb_src
    forced_bos_token_id = tokenizer.convert_tokens_to_ids(nllb_tgt)

    try:
        for batch in chunk_list(data, batch_size):
            texts = [item.get("text", "").strip() for item in batch]
            non_empty_indices = [idx for idx, t in enumerate(texts) if t]
            non_empty_texts = [texts[idx] for idx in non_empty_indices]

            if non_empty_texts:
                inputs = tokenizer(
                    non_empty_texts,
                    return_tensors="pt",
                    padding=True,
                    truncation=True,
                    max_length=128
                ).to(device)

                with torch.no_grad():
                    generated_tokens = model.generate(
                        **inputs,
                        forced_bos_token_id=forced_bos_token_id,
                        max_length=128,
                        num_beams=2
                    )

                translations = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)

                for orig_idx, trans in zip(non_empty_indices, translations):
                    batch[orig_idx]["translated"] = trans

            for idx, t in enumerate(texts):
                if not t:
                    batch[idx]["translated"] = ""

        logger.info(f"[NLLB] Hoàn thành dịch {total} dòng.")
    except Exception as e:
        logger.error(f"[NLLB] Lỗi dịch batch: {e}")
        raise e
    finally:
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    return data


_GOOGLE_ERROR_MARKERS = (
    "Error ", "Server Error", "<!DOCTYPE", "<html", "That's an error"
)

def _is_google_error(text: str) -> bool:
    if text is None:
        return True
    stripped = text.strip()
    return any(marker in stripped for marker in _GOOGLE_ERROR_MARKERS)

GEMINI_MODEL = "gemini-3.1-flash-lite"

def _call_gemini_generate(contents: str, response_mime_type: str = "application/json", max_retries: int = 4) -> str:
    last_error = None
    config = types.GenerateContentConfig(
        temperature=0.2,
        response_mime_type=response_mime_type
    )

    for attempt in range(1, max_retries + 1):
        try:
            response = _gemini_client.models.generate_content(
                model=GEMINI_MODEL,
                contents=contents,
                config=config
            )
            if response and response.text:
                return response.text
        except Exception as e:
            err_str = str(e)
            last_error = e
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "quota" in err_str.lower():
                wait_time = attempt * 3.0
                logger.warning(f"[Gemini] {GEMINI_MODEL} bị 429 Quota (attempt {attempt}/{max_retries}). Chờ {wait_time}s rồi thử lại...")
                time.sleep(wait_time)
            else:
                logger.warning(f"[Gemini] {GEMINI_MODEL} gặp lỗi: {e}")
                time.sleep(1.5)

    raise last_error or Exception(f"Gemini API ({GEMINI_MODEL}): Không thể hoàn tất sau {max_retries} lần thử.")


def _gemini_translate_batch(
    batch_items: list,
    tgt_lang: str,
    video_title: str = "",
    video_tags: str = "",
    channel: str = ""
) -> list[str]:
    """Dịch một batch phụ đề bằng Gemini API kèm Video Context, chống lỗi 429."""
    payload = [{"id": i, "text": item.get("text", "").strip()} for i, item in enumerate(batch_items)]
    
    context_section = ""
    if video_title or video_tags or channel:
        context_section = (
            f"## Video Context (Use this context to accurately translate proper nouns, specialized terms, jargon, names, and tone):\n"
            f"- **Title:** {video_title or 'N/A'}\n"
            f"- **Channel:** {channel or 'N/A'}\n"
            f"- **Tags/Keywords:** {video_tags or 'N/A'}\n\n"
        )

    prompt = (
        f"You are a professional subtitle translator.\n"
        f"{context_section}"
        f"Your task is to translate each subtitle item's 'text' into {tgt_lang}.\n"
        "Rules:\n"
        "1. Keep natural subtitle phrasing and appropriate tone in context of the continuous video dialogue.\n"
        "2. Accurately translate proper nouns, specialized jargon, and slang based on the Video Context.\n"
        "3. Maintain EXACT same number of elements and same ordering.\n"
        "4. Return ONLY a valid JSON array of strings containing translations, e.g. [\"câu 1\", \"câu 2\", ...].\n\n"
        f"Subtitles to translate:\n{json.dumps(payload, ensure_ascii=False)}"
    )

    try:
        raw_text = _call_gemini_generate(
            contents=prompt,
            response_mime_type="application/json"
        )
        translated_list = json.loads(raw_text)
        if isinstance(translated_list, list) and len(translated_list) == len(batch_items):
            return [str(t).strip() for t in translated_list]
        logger.warning(f"[Gemini batch] Output JSON length mismatch (got {len(translated_list)}, expected {len(batch_items)}).")
    except Exception as e:
        logger.error(f"[Gemini batch] Lỗi dịch batch: {e}")
    return [item.get("text", "") for item in batch_items]


def translateUsingGemini(
    data: list,
    tgt_lang: str = "vi",
    video_title: str = "",
    video_tags: str = "",
    channel: str = "",
    target_batches: int = 4
) -> list:
    total = len(data)
    if total == 0:
        return data

    batch_size = calculate_optimal_batch_size(
        total_items=total,
        target_batches=target_batches,
        min_batch_size=25,
        max_batch_size=250
    )
    num_batches = math.ceil(total / batch_size)
    logger.info(f"[Gemini] Bắt đầu dịch {total} dòng -> {tgt_lang} (tự động chia {num_batches} batch, ~{batch_size} câu/batch)")

    for batch_idx, batch in enumerate(chunk_list(data, batch_size), start=1):
        logger.info(f"[Gemini] Đang dịch batch [{batch_idx}/{num_batches}] ({len(batch)} câu)...")
        translations = _gemini_translate_batch(
            batch_items=batch,
            tgt_lang=tgt_lang,
            video_title=video_title,
            video_tags=video_tags,
            channel=channel
        )
        for item, trans in zip(batch, translations):
            item["translated"] = trans

    logger.info(f"[Gemini] Hoàn thành dịch {total} dòng ({num_batches} batch).")
    return data


def translateUsingGoogle(
    data: list,
    src_lang: str = "en",
    tgt_lang: str = "vi",
    video_title: str = "",
    video_tags: str = "",
    channel: str = "",
    target_batches: int = 4
) -> list:
    if src_lang == tgt_lang:
        logger.info(f"src_lang == tgt_lang ({src_lang}), bỏ qua dịch.")
        for item in data:
            item["translated"] = item.get("text", "")
        return data

    total = len(data)
    if total == 0:
        return data

    batch_size = calculate_optimal_batch_size(
        total_items=total,
        target_batches=target_batches,
        min_batch_size=20,
        max_batch_size=60
    )
    num_batches = math.ceil(total / batch_size)

    google_translator = GoogleTranslator(source="auto", target=tgt_lang)
    logger.info(f"[Google] Bắt đầu dịch {total} dòng ({src_lang} → {tgt_lang}) - chia {num_batches} batch (~{batch_size} câu/batch)")

    for batch_idx, batch in enumerate(chunk_list(data, batch_size), start=1):
        texts = [item.get("text", "").strip() for item in batch]
        
        if not any(texts):
            for item in batch:
                item["translated"] = ""
            continue

        logger.info(f"[Google] Đang dịch batch [{batch_idx}/{num_batches}] ({len(batch)} câu)...")
        translations = None
        MAX_RETRIES = 2
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                translations = google_translator.translate_batch(texts)
                has_error = any(_is_google_error(t) for t in translations)
                if not has_error:
                    break
                logger.warning(f"  [Batch {batch_idx}] Google trả về lỗi marker (attempt {attempt}/{MAX_RETRIES})")
            except Exception as e:
                logger.warning(f"  [Batch {batch_idx}] Google exception (attempt {attempt}/{MAX_RETRIES}): {e}")
                translations = None

            if attempt < MAX_RETRIES:
                time.sleep(1.5)

        if translations is None or any(_is_google_error(t) for t in translations):
            logger.warning(f"  [Batch {batch_idx}] Google fail -> Fallback toàn bộ batch {len(batch)} câu sang Gemini")
            translations = _gemini_translate_batch(
                batch_items=batch,
                tgt_lang=tgt_lang,
                video_title=video_title,
                video_tags=video_tags,
                channel=channel
            )

        for item, trans in zip(batch, translations):
            item["translated"] = trans

    logger.info(f"[Google] Hoàn thành dịch {total} dòng ({num_batches} batch).")
    return data
