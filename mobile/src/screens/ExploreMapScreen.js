import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { COLORS } from '../theme/colors';
import { PARKING_FACILITIES } from '../data/facilitiesData';
import { FacilityCard } from '../components/FacilityCard';

const CATEGORIES = ['All', 'Hub', 'Commercial', 'Transit', 'Retail', 'Hospital'];

export function ExploreMapScreen({ onSelectFacility, onBookFacility }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFacilities = PARKING_FACILITIES.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search city lots, malls, metro stations..."
          placeholderTextColor={COLORS.textMuted}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Categories Horizontal Scroll */}
      <View style={styles.catContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, isSelected && styles.catChipActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.catText, isSelected && styles.catTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Map GPS Header Banner */}
      <View style={styles.mapBanner}>
        <View style={styles.mapBannerIcon}>
          <Text style={styles.mapIcon}>🗺️</Text>
        </View>
        <View style={styles.mapBannerText}>
          <Text style={styles.mapBannerTitle}>GPS City Radar Active</Text>
          <Text style={styles.mapBannerSub}>Displaying {filteredFacilities.length} smart facilities in range</Text>
        </View>
      </View>

      {/* Facility List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredFacilities.map(fac => (
          <FacilityCard
            key={fac.id}
            facility={fac}
            onSelect={onSelectFacility}
            onBookDirect={onBookFacility}
          />
        ))}

        {filteredFacilities.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyTitle}>No Parking Lots Found</Text>
            <Text style={styles.emptySub}>Try adjusting your search keyword or category filter.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#ffffff',
    fontSize: 13,
  },
  clearIcon: {
    color: '#94a3b8',
    fontSize: 14,
    padding: 4,
  },
  catContainer: {
    marginBottom: 10,
  },
  catScroll: {
    gap: 8,
  },
  catChip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  catChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#3b82f6',
  },
  catText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
  },
  catTextActive: {
    color: '#ffffff',
  },
  mapBanner: {
    backgroundColor: '#131b2e',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  mapBannerIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapIcon: {
    fontSize: 16,
  },
  mapBannerText: {
    flex: 1,
  },
  mapBannerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#ffffff',
  },
  mapBannerSub: {
    fontSize: 10,
    color: '#38bdf8',
  },
  listContent: {
    paddingBottom: 30,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
  },
  emptySub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
});
