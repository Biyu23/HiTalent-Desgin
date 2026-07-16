import {
  componentRegistry,
  getComponentNames,
} from '../data/component-registry.js';
export function handleListComponents() {
  const names = getComponentNames();
  const components = names.map((name) => {
    const comp = componentRegistry[name];
    return {
      name: comp.name,
      description: comp.description,
      category: comp.category,
      features: comp.features,
    };
  });
  return {
    total: components.length,
    components,
  };
}
//# sourceMappingURL=list-components.js.map
