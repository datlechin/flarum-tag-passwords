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
    .registerPermission({
      permission: 'flarum-tag-passwords.display_unlock_icon',
      icon: 'fas fa-unlock',
      label: app.translator.trans('datlechin-tag-passwords.admin.setting.display_unlock_icon'),
      allowGuest: true
    }, 'view')
    .registerPermission({
      permission: 'flarum-tag-passwords.display_protected_tag_from_sidebar',
      icon: 'fas fa-bars',
      label: app.translator.trans('datlechin-tag-passwords.admin.setting.display_protected_tag_from_sidebar'),
      allowGuest: true
    }, 'view')
    .registerPermission({
      permission: 'flarum-tag-passwords.display_protected_tag_from_tags_page',
      icon: 'fas fa-th-list',
      label: app.translator.trans('datlechin-tag-passwords.admin.setting.display_protected_tag_from_tags_page'),
      allowGuest: true
    }, 'view')
    .registerPermission({
      permission: 'flarum-tag-passwords.display_protected_tag_from_discussion_list',
      icon: 'fas fa-list',
      label: app.translator.trans('datlechin-tag-passwords.admin.setting.display_protected_tag_from_discussion_list'),
      allowGuest: true
    }, 'view')
    .registerPermission({
        permission: 'flarum-tag-passwords.display_discussion_avator',
        icon: 'fas fa-user-secret',
        label: app.translator.trans('datlechin-tag-passwords.admin.setting.discussion.avatar'),
        allowGuest: true
    }, 'view')
    .registerPermission({
      permission: 'flarum-tag-passwords.display_protected_tag_from_post_list',
      icon: 'fas fa-pen-square',
      label: app.translator.trans('datlechin-tag-passwords.admin.setting.display_protected_tag_from_post_list'),
      allowGuest: true
    }, 'view')
    .registerPermission({
      permission: 'flarum-tag-passwords.display_protected_tag_from_discussion_page',
      icon: 'fas fa-link',
      label: app.translator.trans('datlechin-tag-passwords.admin.setting.display_protected_tag_from_discussion_page'),
      allowGuest: true
    }, 'view')

  Tag.prototype.isPasswordProtected = Model.attribute('isPasswordProtected');
  Tag.prototype.isGroupProtected = Model.attribute('isGroupProtected');
  Tag.prototype.password = Model.attribute('password');
  Tag.prototype.protectedGroups = Model.attribute('protectedGroups');

  extend(EditTagModal.prototype, 'oninit', function () {
    this.isPasswordProtected = Stream(this.tag.password() || false);
    this.password = Stream(this.tag.password() || '');
    this.isGroupProtected = Stream(this.tag.protectedGroups() || false);
    this.protectedGroups = this.tag.protectedGroups() ? JSON.parse(this.tag.protectedGroups()) : [];
  });

  extend(EditTagModal.prototype, 'fields', function (items) {
    items.add(
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

          {this.isGroupProtected() && !this.isPasswordProtected() ? (
            <table className="GroupListTable">
              <tbody>
                {this.protectedGroups === null ? (
                  <tr>
                    <td>
                      <LoadingIndicator />
                    </td>
                  </tr>
                ) : (
                  this.protectedGroups.map((item, index) => (
                    <tr>
                      <td>
                        {app.store
                          .all('groups')
                          .filter((group) => group.id() == item.id)
                          .map((group) => group.namePlural())}
                      </td>
                      <td>
                        <button
                          className="Button Button--danger"
                          onclick={(event) => {
                            event.preventDefault(); // Do not close the settings modal
                            this.protectedGroups.splice(index, 1);
                            m.redraw();
                          }}
                        >
                          {icon('fas fa-times')}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
                <tr>
                  <td colspan="5">
                    <Dropdown label={app.translator.trans('datlechin-tag-passwords.admin.edit_tag.select_group')} buttonClassName="Button">
                      {app.store
                        .all('groups')
                        .filter((group) => {
                          if (group.id() === Group.MEMBER_ID || group.id() === Group.GUEST_ID) {
                            // Do not suggest "virtual" groups
                            return false;
                          }

                          // Do not suggest groups already in use
                          var isFound = false;
                          if (Array.isArray(this.protectedGroups)) {
                            this.protectedGroups.forEach((protectedGroup) => {
                              if (protectedGroup.id == group.id()) {
                                isFound = true;
                              }
                            });
                          }
                          return !isFound;
                        })
                        .map((group) => (
                          <Button
                            onclick={() => {
                              this.protectedGroups.push({ id: Number(group.id()) });
                              m.redraw();
                            }}
                          >
                            {group.namePlural()}
                          </Button>
                        ))}
                    </Dropdown>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            ''
          )}
        </div>
      </div>
    );
  });

  extend(EditTagModal.prototype, 'submitData', function (data) {
    data.password = this.isPasswordProtected() ? this.password() : null;
    data.protected_groups = this.isGroupProtected() && this.protectedGroups.length > 0 ? JSON.stringify(this.protectedGroups) : null;
  });
});
