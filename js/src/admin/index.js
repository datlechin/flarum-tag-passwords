import app from 'flarum/admin/app';
import { extend } from 'flarum/common/extend';
import Tag from 'flarum/tags/models/Tag';
import Model from 'flarum/common/Model';
import EditTagModal from 'flarum/tags/components/EditTagModal';
import Stream from 'flarum/utils/Stream';
import icon from 'flarum/common/helpers/icon';
import Button from 'flarum/common/components/Button';
import Dropdown from 'flarum/common/components/Dropdown';
import Group from 'flarum/common/models/Group';

app.initializers.add('datlechin/flarum-tag-passwords', () => {
  app.extensionData
    .for('datlechin-tag-passwords')
    .registerSetting({
        setting: 'flarum-tag-passwords.display_unlock_icon',
        label: app.translator.trans('datlechin-tag-passwords.admin.setting.display_unlock_icon'),
        type: 'switch',
    })
    .registerSetting({
        setting: 'flarum-tag-passwords.display_protected_tag_from_sidebar',
        label: app.translator.trans('datlechin-tag-passwords.admin.setting.display_protected_tag_from_sidebar'),
        type: 'switch',
    })
    .registerSetting({
        setting: 'flarum-tag-passwords.display_protected_tag_from_tags_page',
        label: app.translator.trans('datlechin-tag-passwords.admin.setting.display_protected_tag_from_tags_page'),
        type: 'switch',
    });

    
  Tag.prototype.isPasswordProtected = Model.attribute('isPasswordProtected');
  Tag.prototype.isGroupProtected = Model.attribute('isGroupProtected');
  Tag.prototype.password = Model.attribute('password');
  Tag.prototype.protectedGroupIds = Model.attribute('protectedGroupIds');

  extend(EditTagModal.prototype, 'oninit', function () {
    this.isPasswordProtected = Stream(this.tag.password() || false);
    this.password = Stream(this.tag.password() || '');
    this.isGroupProtected = Stream(this.tag.protectedGroupIds() || false);
    this.protectedGroupIds = this.tag.protectedGroupIds() != null? this.tag.protectedGroupIds().split(","): [];
  });

  extend(EditTagModal.prototype, 'fields', function (items) {
    items
      .add(
        'protectedType',
        <div className="Form-group">
          <label>{app.translator.trans('datlechin-tag-passwords.admin.edit_tag.protected_label')}</label>
          <div>
            <label className="checkbox">
              <input type="checkbox" bidi={this.isPasswordProtected} />
              {app.translator.trans('datlechin-tag-passwords.admin.edit_tag.password_protected_label')}
            </label>
            <label className="checkbox">
              <input type="checkbox" bidi={this.isGroupProtected} />
              {app.translator.trans('datlechin-tag-passwords.admin.edit_tag.group_protected_label')}
            </label>
            {this.isPasswordProtected() && !this.isGroupProtected() ? (
              <input
                className="FormControl"
                bidi={this.password}
                placeholder={app.translator.trans('datlechin-tag-passwords.admin.edit_tag.password_placeholder_label')}
              />
            ) : (
              ''
            )}

            {this.isGroupProtected() && !this.isPasswordProtected() ?
              m('table.GroupListTable', m('tbody', [
        this.protectedGroupIds === null ? m('tr', m('td', LoadingIndicator.component())) : this.protectedGroupIds.map((item, index) => m('tr', [
              m('td', app.store.all('groups').filter(group => group.id() == Number(item)).map(group => group.namePlural())),
              m('td', m('button.Button.Button--danger', {
                  onclick: event => {
                      event.preventDefault(); // Do not close the settings modal
                      this.protectedGroupIds.splice(index, 1);
                      m.redraw();
                  },
              }, icon('fas fa-times'))),
          ])),
          m('tr', m('td', {
              colspan: 5,
          }, Dropdown.component({
              label: app.translator.trans('datlechin-tag-passwords.admin.edit_tag.select_group'),
              buttonClassName: 'Button',
          }, app.store.all('groups')
              .filter(group => {
                  if (group.id() === Group.MEMBER_ID || group.id() === Group.GUEST_ID) {
                      // Do not suggest "virtual" groups
                      return false;
                  }

                  // Do not suggest groups already in use
                  var isFound = false;
                  if (Array.isArray(this.protectedGroupIds)) {
                    this.protectedGroupIds.forEach((groupId) => {
                      if (groupId == group.id()) {
                        isFound = true;
                      }
                    });
                  }
                  return !isFound;
              })
              .map(group => Button.component({
                  onclick: () => {
                    this.protectedGroupIds.push(group.id());
                    m.redraw();
                  },
              }, group.namePlural()))))),
            ]))
            :''}
          </div>
        </div>
    )
  });

  extend(EditTagModal.prototype, 'submitData', function (data) {
    data.password = this.isPasswordProtected() ? this.password() : null;
    data.protected_group_ids = this.isGroupProtected() && this.protectedGroupIds.length > 0 ? this.protectedGroupIds.toString() : null;
  });
});