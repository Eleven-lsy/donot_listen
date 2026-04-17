package com.donotlisten.navigation.service;

import com.donotlisten.listening.dto.ListeningListResponse;
import com.donotlisten.navigation.dto.NavigationResponse;
import com.donotlisten.listening.mapper.ListeningMaterialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NavigationService {

    private final ListeningMaterialMapper listeningMaterialMapper;

    public NavigationResponse getNavigation() {
        List<ListeningListResponse.ListeningItem> all = listeningMaterialMapper.findAllGrouped();
        List<NavigationResponse.YearSection> years = buildYearSections(all);
        List<NavigationResponse.SpecialSection> special = buildSpecialSection(all);
        return NavigationResponse.builder().years(years).special(special).build();
    }

    private List<NavigationResponse.YearSection> buildYearSections(List<ListeningListResponse.ListeningItem> all) {
        Map<Integer, Map<Integer, List<ListeningListResponse.ListeningItem>>> grouped = all.stream()
                .collect(Collectors.groupingBy(
                        ListeningListResponse.ListeningItem::getYear,
                        TreeMap::new,
                        Collectors.groupingBy(
                                ListeningListResponse.ListeningItem::getMonth,
                                TreeMap::new,
                                Collectors.toList()
                        )
                ));
        
        List<NavigationResponse.YearSection> years = new ArrayList<>();
        String[] monthNames = new String[]{"", "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"};
        
        for (Map.Entry<Integer, Map<Integer, List<ListeningListResponse.ListeningItem>>> yearEntry : grouped.entrySet()) {
            int year = yearEntry.getKey();
            Map<Integer, List<ListeningListResponse.ListeningItem>> monthMap = yearEntry.getValue();
            List<NavigationResponse.MonthSection> months = new ArrayList<>();
            
            for (Map.Entry<Integer, List<ListeningListResponse.ListeningItem>> monthEntry : monthMap.entrySet()) {
                int month = monthEntry.getKey();
                List<ListeningListResponse.ListeningItem> monthItems = monthEntry.getValue();
                List<NavigationResponse.ListeningItem> cet4 = buildSetGroups(monthItems, 4, year, month);
                List<NavigationResponse.ListeningItem> cet6 = buildSetGroups(monthItems, 6, year, month);
                if (!cet4.isEmpty() || !cet6.isEmpty()) {
                    months.add(NavigationResponse.MonthSection.builder()
                            .title(monthNames[month])
                            .cet4(cet4)
                            .cet6(cet6)
                            .build());
                }
            }
            years.add(NavigationResponse.YearSection.builder()
                    .title(year + "年")
                    .id("year-" + year)
                    .months(months)
                    .build());
        }
        return years;
    }

    private List<NavigationResponse.ListeningItem> buildSetGroups(List<ListeningListResponse.ListeningItem> items, int level, int year, int month) {
        List<NavigationResponse.ListeningItem> result = new ArrayList<>();
        Map<Integer, List<ListeningListResponse.ListeningItem>> bySet = items.stream()
                .filter(i -> i.getLevel() != null && i.getLevel() == level)
                .collect(Collectors.groupingBy(
                        i -> i.getSetNumber() != null ? i.getSetNumber() : 1,
                        TreeMap::new,
                        Collectors.toList()
                ));
        
        for (Map.Entry<Integer, List<ListeningListResponse.ListeningItem>> setEntry : bySet.entrySet()) {
            int setNum = setEntry.getKey();
            List<ListeningListResponse.ListeningItem> setItems = setEntry.getValue();
            List<NavigationResponse.ListeningItem> children = buildOrderedChildren(setItems, year, month);
            result.add(NavigationResponse.ListeningItem.builder()
                    .id("set-" + level + "-" + setNum)
                    .label("第" + setNum + "套")
                    .setNumber(setNum)
                    .items(children)
                    .build());
        }
        return result;
    }

    private List<NavigationResponse.ListeningItem> buildOrderedChildren(List<ListeningListResponse.ListeningItem> items, int year, int month) {
        List<NavigationResponse.ListeningItem> result = new ArrayList<>();
        String[] typeOrder = new String[]{"LECTURE", "DIALOGUE", "PASSAGE"};
        String[] labelOrder = new String[]{"新闻报道", "对话", "短文"};
        
        for (int i = 0; i < typeOrder.length; i++) {
            final String type = typeOrder[i];
            final String label = labelOrder[i];
            ListeningListResponse.ListeningItem item = items.stream()
                    .filter(it -> type.equals(it.getType()))
                    .sorted((a, b) -> {
                        return a.getId().compareTo(b.getId());
                    })
                    .findFirst()
                    .orElse(null);
            if (item != null) {
                result.add(NavigationResponse.ListeningItem.builder()
                        .id(item.getId())
                        .label(label)
                        .type(type)
                        .setNumber(item.getSetNumber())
                        .year(year)
                        .month(month)
                        .level(item.getLevel())
                        .items(null)
                        .build());
            }
        }
        return result;
    }

    private List<NavigationResponse.SpecialSection> buildSpecialSection(List<ListeningListResponse.ListeningItem> all) {
        List<NavigationResponse.SpecialSection> special = new ArrayList<>();
        
        String[] typeOrder = new String[]{"LECTURE", "DIALOGUE", "PASSAGE"};
        String[] labelOrder = new String[]{"新闻训练", "对话训练", "短文训练"};
        
        List<NavigationResponse.ListeningItem> trainingItems = new ArrayList<>();
        
        for (int i = 0; i < typeOrder.length; i++) {
            final String type = typeOrder[i];
            final String label = labelOrder[i];
            
            List<ListeningListResponse.ListeningItem> typeItems = all.stream()
                    .filter(it -> type.equals(it.getType()))
                    .sorted((a, b) -> {
                        int yearCompare = b.getYear().compareTo(a.getYear());
                        if (yearCompare != 0) return yearCompare;
                        int monthCompare = b.getMonth().compareTo(a.getMonth());
                        if (monthCompare != 0) return monthCompare;
                        return a.getId().compareTo(b.getId());
                    })
                    .collect(Collectors.toList());
            
            if (!typeItems.isEmpty()) {
                ListeningListResponse.ListeningItem firstItem = typeItems.get(0);
                trainingItems.add(NavigationResponse.ListeningItem.builder()
                        .id(firstItem.getId())
                        .label(label)
                        .type(type)
                        .year(firstItem.getYear())
                        .month(firstItem.getMonth())
                        .setNumber(firstItem.getSetNumber())
                        .level(firstItem.getLevel())
                        .build());
            }
        }
        
        if (!trainingItems.isEmpty()) {
            special.add(NavigationResponse.SpecialSection.builder()
                    .title("专项训练")
                    .id("special-training")
                    .items(trainingItems)
                    .build());
        }
        
        return special;
    }
}
