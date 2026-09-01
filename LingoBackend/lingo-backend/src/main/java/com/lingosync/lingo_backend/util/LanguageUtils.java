package com.lingosync.lingo_backend.util;

import java.util.Locale;
import java.util.Map;
import lombok.Builder;
import lombok.Getter;

public class LanguageUtils {

    @Getter
    @Builder
    public static class LanguageInfo {
        private String code;
        private String vietnameseName;
        private String englishName;
        private String flag;
        private String starterPlaylistName;
        private String starterPlaylistDescription;
    }

    private static final Map<String, LanguageInfo> PRESET_LANGUAGES = Map.of(
            "en", LanguageInfo.builder()
                    .code("en")
                    .vietnameseName("Tiếng Anh")
                    .englishName("English")
                    .flag("🇬🇧")
                    .starterPlaylistName("Tiếng Anh khởi động")
                    .starterPlaylistDescription("Các bài học tiếng Anh giao tiếp cơ bản cho người mới bắt đầu")
                    .build(),
            "zh", LanguageInfo.builder()
                    .code("zh")
                    .vietnameseName("Tiếng Trung")
                    .englishName("Chinese")
                    .flag("🇨🇳")
                    .starterPlaylistName("Tiếng Trung khởi động")
                    .starterPlaylistDescription("Luyện nghe và từ vựng tiếng Trung sơ cấp (HSK 1-2)")
                    .build(),
            "ja", LanguageInfo.builder()
                    .code("ja")
                    .vietnameseName("Tiếng Nhật")
                    .englishName("Japanese")
                    .flag("🇯🇵")
                    .starterPlaylistName("Tiếng Nhật khởi động")
                    .starterPlaylistDescription("Các bài học tiếng Nhật sơ cấp (N5-N4) qua video sinh động")
                    .build(),
            "ko", LanguageInfo.builder()
                    .code("ko")
                    .vietnameseName("Tiếng Hàn")
                    .englishName("Korean")
                    .flag("🇰🇷")
                    .starterPlaylistName("Tiếng Hàn khởi động")
                    .starterPlaylistDescription("Học tiếng Hàn giao tiếp và phát âm chuẩn từ đầu")
                    .build(),
            "de", LanguageInfo.builder()
                    .code("de")
                    .vietnameseName("Tiếng Đức")
                    .englishName("German")
                    .flag("🇩🇪")
                    .starterPlaylistName("Tiếng Đức khởi động")
                    .starterPlaylistDescription("Các bài học tiếng Đức nhập môn A1")
                    .build(),
            "fr", LanguageInfo.builder()
                    .code("fr")
                    .vietnameseName("Tiếng Pháp")
                    .englishName("French")
                    .flag("🇫🇷")
                    .starterPlaylistName("Tiếng Pháp khởi động")
                    .starterPlaylistDescription("Làm quen với ngữ âm và từ vựng tiếng Pháp cơ bản")
                    .build(),
            "es", LanguageInfo.builder()
                    .code("es")
                    .vietnameseName("Tiếng Tây Ban Nha")
                    .englishName("Spanish")
                    .flag("🇪🇸")
                    .starterPlaylistName("Tiếng Tây Ban Nha khởi động")
                    .starterPlaylistDescription("Học tiếng Tây Ban Nha giao tiếp từ con số 0")
                    .build());

    public static LanguageInfo getLanguageInfo(String langCode) {
        String code = (langCode != null) ? langCode.toLowerCase().trim() : "en";

        if (PRESET_LANGUAGES.containsKey(code)) {
            return PRESET_LANGUAGES.get(code);
        }
        Locale locale = Locale.forLanguageTag(code);
        String name = locale.getDisplayLanguage(Locale.forLanguageTag("vi"));
        if (name == null || name.isBlank()) {
            name = locale.getDisplayLanguage(Locale.ENGLISH);
        }
        name = Character.toUpperCase(name.charAt(0)) + name.substring(1);

        return LanguageInfo.builder()
                .code(code)
                .vietnameseName(name)
                .englishName(locale.getDisplayLanguage(Locale.ENGLISH))
                .flag("🌐")
                .starterPlaylistName(name + " khởi động")
                .starterPlaylistDescription("Danh sách bài học " + name + " khởi động dành cho người mới bắt đầu")
                .build();
    }

    public static Map<String, LanguageInfo> getPresetLanguages() {
        return PRESET_LANGUAGES;
    }

    public static boolean isSupported(String langCode) {
        if (langCode == null) return false;
        return PRESET_LANGUAGES.containsKey(langCode.toLowerCase().trim());
    }
}
