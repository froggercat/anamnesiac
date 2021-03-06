
import { promises } from 'fs';
import * as fs from 'fs';

import test from 'ava';
import * as YAML from 'js-yaml';
import * as _ from 'lodash';

import { Item } from '../app/models/item';

const ROOT_FILE = 'src/assets/data/root.yml';

test('All items have valid information', async t => {
  const allData = await promises.readFile(ROOT_FILE, 'utf-8');
  const { weapons, accessories } = YAML.safeLoad(allData);

  const allItems = weapons.concat(accessories);

  const itemElements = ['Dark', 'Earth', 'Fire', 'Ice', 'Light', 'Lightning', 'Wind'];
  const itemSlayers  = ['Beast', 'Bird', 'Demon', 'Divinity', 'Dragon', 'Human', 'Insect', 'Machine', 'Plant', 'Undead'];

  await Promise.all(allItems.map(async ({ id }) => {

    const type = id === 'all' ? 'accessory' : 'weapon';

    const data = await promises.readFile(`src/assets/data/item/${type}/${id}.yml`, 'utf-8');
    const items: Item[] = YAML.safeLoad(data);

    items.forEach(item => {
      const parenName = ` (${item.name})`;

      t.truthy(item.name, 'name must be set');
      t.falsy(item.type, 'type should not be set' + parenName);
      t.falsy(item.subtype, 'subtype should not be set' + parenName);
      t.true(item.cat === 'jp' || item.cat === 'gl', 'cat must be jp or gl' + parenName);
      t.truthy(item.picture, 'must have a picture url' + parenName);
      t.true(item.star >= 0 && item.star <= 5, 'rating must be between 1 and 5' + parenName);

      t.true(item.factors.length > 0, 'item should have at least one factor' + parenName);
      t.truthy(item.obtained, 'item must mention where it is obtained' + parenName);

      const subtype = id === 'all' ? 'accessory' : id;
      t.true(fs.existsSync(`src/assets/items/${subtype}/${item.picture}.png`), 'item must reference a valid image' + parenName);

      item.factors.forEach(factor => {
        if(factor.slayer) {
          t.true(_.includes(itemSlayers, factor.slayer), 'item must have a valid slayer [check the model]' + parenName);
        }
        if(factor.element) {
          t.true(_.includes(itemElements, factor.element), 'item must have a valid element [check the model]' + parenName);
        }
      });

    });
  }));
});
