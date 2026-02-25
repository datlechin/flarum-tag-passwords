import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Icon from 'flarum/common/components/Icon';
import Button from 'flarum/common/components/Button';
import Dropdown from 'flarum/common/components/Dropdown';
import Group from 'flarum/common/models/Group';

export default class GroupSelector extends Component {
  view() {
    const groups = this.attrs.groups || [];

    return (
      <table className="GroupListTable">
        <tbody>
          {groups.map((item, index) => (
            <tr>
              <td>
                {app.store
                  .all('groups')
                  .filter((group) => group.id() === String(item.id))
                  .map((group) => group.namePlural())}
              </td>
              <td>
                <button
                  className="Button Button--danger"
                  onclick={(event) => {
                    event.preventDefault();
                    groups.splice(index, 1);
                    m.redraw();
                  }}
                >
                  <Icon name="fas fa-times" />
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td colspan="5">
              <Dropdown label={app.translator.trans('datlechin-tag-passwords.admin.edit_tag.select_group')} buttonClassName="Button">
                {app.store
                  .all('groups')
                  .filter((group) => {
                    if (group.id() === Group.MEMBER_ID || group.id() === Group.GUEST_ID) {
                      return false;
                    }
                    return !groups.some((pg) => String(pg.id) === group.id());
                  })
                  .map((group) => (
                    <Button
                      onclick={() => {
                        groups.push({ id: Number(group.id()) });
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
    );
  }
}
