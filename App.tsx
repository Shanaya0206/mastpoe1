import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  FlatList,
  Alert,
  ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';


type Course = 'Starters' | 'Mains' | 'Dessert';

interface MenuItem {
  id: string;
  dishName: string;
  description: string;
  course: Course;
  price: number;
}

// background images
const backgroundImages = {
  home: { uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&w=800&q=80' },
  add: { uri: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&w=800&q=80' },
  filter: { uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&w=800&q=80' }
};

// splash screen
function SplashScreen({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000); 

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.splashContainer}>
      <View style={styles.splashContent}>
        <View style={styles.logoCircle}>
          <Ionicons name="restaurant" size={60} color="#8B4513" />
        </View>
        <Text style={styles.splashTitle}>CHRISTOFFEL'S</Text>
        <Text style={styles.splashSubtitle}>D I N E R</Text>
        <Text style={styles.splashTagline}>Flavors Worth Sharing</Text>
        <View style={styles.loadingBar}>
          <View style={styles.loadingProgress} />
        </View>
      </View>
    </View>
  );
}

// shared state using context
const MenuContext = React.createContext<{
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  removeMenuItem: (id: string) => void;
}>({
  menuItems: [],
  addMenuItem: () => {},
  removeMenuItem: () => {},
});

const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: Date.now().toString(),
    };
    setMenuItems(prev => [...prev, newItem]);
  };

  const removeMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <MenuContext.Provider value={{ menuItems, addMenuItem, removeMenuItem }}>
      {children}
    </MenuContext.Provider>
  );
};

const useMenu = () => React.useContext(MenuContext);

// home screen
function HomeScreen() {
  const { menuItems } = useMenu();

  const calculateAveragePrice = (course: Course): number => {
    const courseItems = menuItems.filter(item => item.course === course);
    if (courseItems.length === 0) return 0;
    const total = courseItems.reduce((sum, item) => sum + item.price, 0);
    return total / courseItems.length;
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.menuItem}>
      <View style={styles.itemHeader}>
        <Text style={styles.dishName}>{item.dishName}</Text>
        <View style={[
          styles.courseBadge,
          item.course === 'Starters' && styles.starterBadge,
          item.course === 'Mains' && styles.mainBadge,
          item.course === 'Dessert' && styles.dessertBadge
        ]}>
          <Text style={styles.courseBadgeText}>{item.course}</Text>
        </View>
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.details}>
        <Text style={styles.price}>R{item.price.toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <ImageBackground 
      source={backgroundImages.home} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.title}>CHRISTOFFEL'S DINER</Text>
            <Text style={styles.tagline}>Flavors Worth Sharing</Text>
            <Text style={styles.subtitle}>Total Items: {menuItems.length}</Text>
          </View>

          <View style={styles.averageSection}>
            <Text style={styles.averageTitle}>🍽️ Average Prices</Text>
            <View style={styles.averageGrid}>
              <View style={styles.averageItem}>
                <Text style={styles.averageCourse}>Starters</Text>
                <Text style={styles.averagePrice}>R{calculateAveragePrice('Starters').toFixed(2)}</Text>
              </View>
              <View style={styles.averageItem}>
                <Text style={styles.averageCourse}>Mains</Text>
                <Text style={styles.averagePrice}>R{calculateAveragePrice('Mains').toFixed(2)}</Text>
              </View>
              <View style={styles.averageItem}>
                <Text style={styles.averageCourse}>Dessert</Text>
                <Text style={styles.averagePrice}>R{calculateAveragePrice('Dessert').toFixed(2)}</Text>
              </View>
            </View>
          </View>

          <FlatList
            data={menuItems}
            renderItem={renderMenuItem}
            keyExtractor={item => item.id}
            style={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="restaurant-outline" size={50} color="#8B4513" />
                <Text style={styles.emptyText}>No menu items yet</Text>
                <Text style={styles.emptySubtext}>Add some delicious dishes to get started!</Text>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

// add menu item screen
function AddMenuItemScreen() {
  const { menuItems, addMenuItem, removeMenuItem } = useMenu();

  const [dishName, setDishName] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState<Course>('Starters');
  const [price, setPrice] = useState('');

  const handleAddMenuItem = () => {
    if (!dishName.trim() || !description.trim() || !price.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    addMenuItem({
      dishName: dishName.trim(),
      description: description.trim(),
      course,
      price: priceValue,
    });
    
    // reset form
    setDishName('');
    setDescription('');
    setCourse('Starters');
    setPrice('');
    
    Alert.alert('Success', 'Menu item added successfully! 🎉');
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.menuItem}>
      <View style={styles.itemInfo}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.dishName}</Text>
          <View style={[
            styles.courseBadge,
            item.course === 'Starters' && styles.starterBadge,
            item.course === 'Mains' && styles.mainBadge,
            item.course === 'Dessert' && styles.dessertBadge
          ]}>
            <Text style={styles.courseBadgeText}>{item.course}</Text>
          </View>
        </View>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <View style={styles.itemDetails}>
          <Text style={styles.itemPrice}>R{item.price.toFixed(2)}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeMenuItem(item.id)}
      >
        <Ionicons name="trash-outline" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground 
      source={backgroundImages.add} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.overlay}>
            <View style={styles.header}>
              <Text style={styles.title}>Create New Dish</Text>
              <Text style={styles.tagline}>Add to our culinary collection</Text>
            </View>

            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>🍴 Dish Name</Text>
                <TextInput
                  style={styles.input}
                  value={dishName}
                  onChangeText={setDishName}
                  placeholder="Enter dish name"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>📝 Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe your delicious creation..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>📋 Course Type</Text>
                <View style={styles.courseButtons}>
                  {(['Starters', 'Mains', 'Dessert'] as Course[]).map((courseType) => (
                    <TouchableOpacity
                      key={courseType}
                      style={[
                        styles.courseButton,
                        course === courseType && styles.courseButtonActive,
                      ]}
                      onPress={() => setCourse(courseType)}
                    >
                      <Text
                        style={[
                          styles.courseButtonText,
                          course === courseType && styles.courseButtonTextActive,
                        ]}
                      >
                        {courseType}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>💰 Price (R)</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="Enter price in Rands"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <TouchableOpacity style={styles.addButton} onPress={handleAddMenuItem}>
                <Ionicons name="add-circle" size={24} color="white" />
                <Text style={styles.addButtonText}>Add to Menu</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.currentItemsSection}>
              <Text style={styles.listTitle}>Current Menu Items ({menuItems.length})</Text>
              
              <FlatList
                data={menuItems}
                renderItem={renderMenuItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="fast-food-outline" size={40} color="#8B4513" />
                    <Text style={styles.emptyText}>No dishes added yet</Text>
                  </View>
                }
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

// filter screen
function FilterScreen() {
  const { menuItems } = useMenu();

  const [selectedCourse, setSelectedCourse] = useState<Course | 'All'>('All');

  const filteredItems = selectedCourse === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.course === selectedCourse);

  const courses: (Course | 'All')[] = ['All', 'Starters', 'Mains', 'Dessert'];

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.menuItem}>
      <View style={styles.itemHeader}>
        <Text style={styles.dishName}>{item.dishName}</Text>
        <View style={[
          styles.courseBadge,
          item.course === 'Starters' && styles.starterBadge,
          item.course === 'Mains' && styles.mainBadge,
          item.course === 'Dessert' && styles.dessertBadge
        ]}>
          <Text style={styles.courseBadgeText}>{item.course}</Text>
        </View>
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.details}>
        <Text style={styles.price}>R{item.price.toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <ImageBackground 
      source={backgroundImages.filter} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter by Course</Text>
            <Text style={styles.tagline}>Discover by course type</Text>
            <Text style={styles.subtitle}>
              Showing: {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.filterContainer}>
            {courses.map(course => (
              <TouchableOpacity
                key={course}
                style={[
                  styles.filterButton,
                  selectedCourse === course && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedCourse(course)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedCourse === course && styles.filterButtonTextActive,
                  ]}
                >
                  {course}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={filteredItems}
            renderItem={renderMenuItem}
            keyExtractor={item => item.id}
            style={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={50} color="#8B4513" />
                <Text style={styles.emptyText}>No items found</Text>
                <Text style={styles.emptySubtext}>Try selecting a different course filter</Text>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

// navigation setup
const Tab = createBottomTabNavigator();

function MainApp() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Menu') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Add Dish') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Filter') {
            iconName = focused ? 'filter' : 'filter-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#8B4513',
        tabBarInactiveTintColor: '#CD853F',
        tabBarStyle: { 
          backgroundColor: '#FFF8DC',
          borderTopWidth: 2,
          borderTopColor: '#8B4513'
        },
        headerStyle: { 
          backgroundColor: '#8B4513',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Menu" component={HomeScreen} />
      <Tab.Screen name="Add Dish" component={AddMenuItemScreen} />
      <Tab.Screen name="Filter" component={FilterScreen} />
    </Tab.Navigator>
  );
}

// main app component
export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <SplashScreen onFinish={() => setIsLoading(false)} />;
  }

  return (
    <MenuProvider>
      <NavigationContainer>
        <MainApp />
      </NavigationContainer>
    </MenuProvider>
  );
}

// styles
const styles = StyleSheet.create({
  // Splash Screen Styles
  splashContainer: {
    flex: 1,
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 2,
  },
  splashSubtitle: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: '300',
    letterSpacing: 8,
    marginTop: 5,
  },
  splashTagline: {
    fontSize: 16,
    color: 'white',
    fontStyle: 'italic',
    marginTop: 20,
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginTop: 40,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#FFD700',
    width: '30%',
    borderRadius: 2,
  },

  // Background & Container Styles
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
  },
  scrollView: {
    flex: 1,
  },

  // Header Styles
  header: {
    padding: 20,
    backgroundColor: 'rgba(139, 69, 19, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#FFD700',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 5,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },

  // Content Styles
  averageSection: {
    backgroundColor: 'rgba(255, 248, 220, 0.95)',
    padding: 15,
    margin: 10,
    borderRadius: 8,
  },
  averageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  averageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  averageItem: {
    alignItems: 'center',
    flex: 1,
  },
  averageCourse: {
    fontSize: 14,
    color: '#8B4513',
    fontWeight: '600',
    marginBottom: 5,
  },
  averagePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  list: {
    flex: 1,
    padding: 10,
  },
  menuItem: {
    backgroundColor: 'rgba(255, 248, 220, 0.95)',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dishName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  courseBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    marginLeft: 10,
  },
  starterBadge: {
    backgroundColor: '#FF6B6B',
  },
  mainBadge: {
    backgroundColor: '#4ECDC4',
  },
  dessertBadge: {
    backgroundColor: '#FFD93D',
  },
  courseBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },

  // Form Styles
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formCard: {
    backgroundColor: 'rgba(255, 248, 220, 0.95)',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  courseButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  courseButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  courseButtonActive: {
    backgroundColor: '#8B4513',
  },
  courseButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  courseButtonTextActive: {
    color: 'white',
  },
  addButton: {
    backgroundColor: '#8B4513',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },

  // Current Items Section
  currentItemsSection: {
    padding: 15,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'white',
    textAlign: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  removeButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Filter Styles
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'rgba(255, 248, 220, 0.9)',
    marginBottom: 10,
  },
  filterButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#8B4513',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterButtonTextActive: {
    color: 'white',
  },

  // Empty States
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 248, 220, 0.9)',
    margin: 20,
    borderRadius: 15,
  },
  emptyText: {
    fontSize: 18,
    color: '#8B4513',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
});