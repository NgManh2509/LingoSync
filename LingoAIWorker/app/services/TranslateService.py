from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

model_name = "facebook/nllb-200-1.3B"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

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

def get_nllb_lang_code(whisper_lang_code, default_lang="eng_Latn"):
    return WHISPER_TO_NLLB.get(whisper_lang_code, default_lang)

def translate(text, src_lang="auto", tgt_lang="auto"):
    tokenizer.src_lang = src_lang
    inputs = tokenizer(text, return_tensors="pt").to(device)
    forced_bos_token_id = tokenizer.convert_tokens_to_ids(tgt_lang)

    generated_tokens = model.generate(
        **inputs,
        forced_bos_token_id=forced_bos_token_id,
        max_length=100
    )
    return tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]

def translateAll(data, src_lang="en", tgt_lang="vi"):
    nllb_src = get_nllb_lang_code(src_lang)
    nllb_tgt = get_nllb_lang_code(tgt_lang)

    for item in data:
        original_text = item["text"]
        item["translated"] = translate(original_text, nllb_src, nllb_tgt)

    return data