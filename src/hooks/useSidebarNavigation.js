import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "@nanostores/react";
import { feedsByCategory, categoryExpandedState, updateCategoryExpandState } from "@/stores/feedsStore.js";
import { filter } from "@/stores/articlesStore.js";
import { settingsState } from "@/stores/settingsStore.js";

export function useSidebarNavigation() {
  const navigate = useNavigate();
  const { categoryId, feedId } = useParams();
  const $feedsByCategory = useStore(feedsByCategory);
  const $categoryExpandedState = useStore(categoryExpandedState);
  const $filter = useStore(filter);
  const { defaultExpandCategory } = useStore(settingsState);

  const getAllNavigableItems = () => {
    const items = [];
    
    // 添加"所有文章"和"星标文章"项
    items.push({ type: 'all', id: 'all', path: '/' });
    items.push({ type: 'starred', id: 'starred', path: '/' });
    
    // 添加分组和订阅
    $feedsByCategory.forEach(category => {
      // 添加分组
      items.push({ 
        type: 'category', 
        id: category.id, 
        path: `/category/${category.id}`,
        isExpanded: $categoryExpandedState[category.id] ?? defaultExpandCategory
      });
      
      // 如果分组已展开，添加该分组下的所有订阅
      if ($categoryExpandedState[category.id]) {
        category.feeds.forEach(feed => {
          items.push({ 
            type: 'feed', 
            id: feed.id, 
            categoryId: category.id,
            path: `/feed/${feed.id}` 
          });
        });
      }
    });
    
    return items;
  };

 
  const getCurrentItemIndex = () => {
    const items = getAllNavigableItems();
    
    if (feedId) {
      return items.findIndex(item => item.type === 'feed' && item.id === parseInt(feedId));
    } else if (categoryId) {
      return items.findIndex(item => item.type === 'category' && item.id === categoryId);
    } else if ($filter === 'starred') {
      return items.findIndex(item => item.type === 'starred');
    } else {
      // 默认为"所有文章"（含 unread 筛选）
      return 0;
    }
  };


  const navigateToPrevious = () => {
    const items = getAllNavigableItems();
    const currentIndex = getCurrentItemIndex();
    
    if (currentIndex > 0) {
      const prevItem = items[currentIndex - 1];
      if (prevItem.type === 'all') {
        filter.set('all');
      } else if (prevItem.type === 'starred') {
        filter.set('starred');
      }
      navigate(prevItem.path);
    }
  };


  const navigateToNext = () => {
    const items = getAllNavigableItems();
    const currentIndex = getCurrentItemIndex();
    
    if (currentIndex < items.length - 1) {
      const nextItem = items[currentIndex + 1];
      if (nextItem.type === 'all') {
        filter.set('all');
      } else if (nextItem.type === 'starred') {
        filter.set('starred');
      }
      navigate(nextItem.path);
    }
  };


  const toggleCurrentCategory = () => {
    if (categoryId) {
      const currentState = $categoryExpandedState[categoryId] ?? defaultExpandCategory;
      updateCategoryExpandState(categoryId, !currentState);
    } else if (feedId) {
      // 如果当前是订阅，找到其所属分组
      const items = getAllNavigableItems();
      const currentItem = items.find(item => item.type === 'feed' && item.id === parseInt(feedId));
      if (currentItem && currentItem.categoryId) {
        const currentState = $categoryExpandedState[currentItem.categoryId] ?? defaultExpandCategory;
        updateCategoryExpandState(currentItem.categoryId, !currentState);
        navigate(`/category/${currentItem.categoryId}`);
      }
    }
  };

  return {
    navigateToPrevious,
    navigateToNext,
    toggleCurrentCategory
  };
}
