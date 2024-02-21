import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Stream from 'flarum/common/utils/Stream';
import Button from 'flarum/common/components/Button';

export default class TagGroupRequired extends Component {
  oninit(vnode) {
    super.oninit(vnode);

    this.loading = false;
    this.invalid = false;

    this.tag = this.attrs.currentTag;
  }

  view() {
    return (
      <div className="TagGroupRequired">
        <form onsubmit={this.onsubmit.bind(this)}>
          <div className="Form-group">
            <h3>{app.translator.trans('datlechin-tag-passwords.forum.tag_group_required.title')}</h3>
          </div>
          <Button type="submit" className="Button Button--primary" loading={this.loading}>
            {app.translator.trans('datlechin-tag-passwords.forum.tag_password_required.button_submit')}
          </Button>
        </form>
      </div>
    );
  }

  onsubmit(e) {
    e.preventDefault();

    this.loading = true;
    this.invalid = false;

    app
      .request({
        url: app.forum.attribute('apiUrl') + '/datlechin/tag-passwords/auth',
        method: 'POST',
        body: {
          data: {
            id: this.tag.id(),
          },
        },
      })
      .then((result) => {
        this.tag.pushAttributes({ isUnlocked: true });
        this.loading = false;
        this.invalid = false;
        m.redraw();
      })
      .catch((error) => {
        this.invalid = true;
        this.loading = false;
      });
  }
}
