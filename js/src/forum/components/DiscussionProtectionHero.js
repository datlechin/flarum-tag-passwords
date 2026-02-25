import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Stream from 'flarum/common/utils/Stream';
import Button from 'flarum/common/components/Button';
import Icon from 'flarum/common/components/Icon';
import tagsLabel from 'ext:flarum/tags/common/helpers/tagsLabel';

export default class DiscussionProtectionHero extends Component {
  oninit(vnode) {
    super.oninit(vnode);

    this.passwords = {};
    this.loading = {};
    this.invalid = {};
    this.unlocked = {};
  }

  view() {
    const discussion = this.attrs.discussion;
    const pwTags = discussion.protectedPasswordTags() || [];
    const groupTags = discussion.protectedGroupPermissionTags() || [];
    const tags = discussion.tags();
    const hasPw = pwTags.length > 0;
    const hasGroup = groupTags.length > 0;
    const multipleProtected = pwTags.length + groupTags.length > 1;

    return (
      <header className="Hero DiscussionHero ProtectedDiscussionHero">
        <div className="container">
          <div className="ProtectedDiscussionHero-content">
            <div className="ProtectedDiscussionHero-icon">
              {hasPw && <Icon name="fas fa-lock" />}
              {!hasPw && hasGroup && <Icon name="fas fa-user-lock" />}
            </div>
            <div className="ProtectedDiscussionHero-forms">
              {pwTags.map((tag) => this.passwordForm(tag, multipleProtected))}
              {groupTags.map((tag) => this.groupNotice(tag, multipleProtected))}
            </div>
            <div className="ProtectedDiscussionHero-tags">{tagsLabel(tags, { link: true })}</div>
          </div>
        </div>
      </header>
    );
  }

  passwordForm(tag, showTagName) {
    const tagId = tag.id;

    if (!this.passwords[tagId]) {
      this.passwords[tagId] = Stream('');
    }

    if (this.unlocked[tagId]) {
      return (
        <div className="ProtectedDiscussionHero-form ProtectedDiscussionHero-form--unlocked" key={tagId}>
          <p className="ProtectedDiscussionHero-formLabel">
            <Icon name="fas fa-unlock" /> {tag.name}
          </p>
        </div>
      );
    }

    return (
      <form className="ProtectedDiscussionHero-form" key={tagId} onsubmit={this.onsubmit.bind(this, tag)}>
        <p className="ProtectedDiscussionHero-description">
          {app.translator.trans('datlechin-tag-passwords.forum.tag_password_required.title')}
          {showTagName && <span className="ProtectedDiscussionHero-tagName"> — {tag.name}</span>}
        </p>
        <div className="TagProtectionHero-input">
          <input
            className={'FormControl' + (this.invalid[tagId] ? ' invalid' : '')}
            bidi={this.passwords[tagId]}
            disabled={this.loading[tagId]}
            type="password"
            placeholder="Enter password"
          />
        </div>
        <div className="TagProtectionHero-action">
          <Button type="submit" className="Button Button--primary" loading={this.loading[tagId]}>
            {app.translator.trans('datlechin-tag-passwords.forum.tag_password_required.button_submit')}
          </Button>
        </div>
      </form>
    );
  }

  groupNotice(tag, showTagName) {
    const tagId = tag.id;

    if (this.unlocked[tagId]) {
      return (
        <div className="ProtectedDiscussionHero-form ProtectedDiscussionHero-form--unlocked" key={tagId}>
          <p className="ProtectedDiscussionHero-formLabel">
            <Icon name="fas fa-unlock" /> {tag.name}
          </p>
        </div>
      );
    }

    return (
      <form className="ProtectedDiscussionHero-form" key={tagId} onsubmit={this.onsubmit.bind(this, tag)}>
        <p className={'ProtectedDiscussionHero-description' + (this.invalid[tagId] ? ' ProtectedDiscussionHero-description--invalid' : '')}>
          {app.translator.trans('datlechin-tag-passwords.forum.tag_group_required.title')}
          {showTagName && <span className="ProtectedDiscussionHero-tagName"> — {tag.name}</span>}
        </p>
        <div className="TagProtectionHero-action">
          <Button type="submit" className="Button Button--primary" loading={this.loading[tagId]}>
            {app.translator.trans('datlechin-tag-passwords.forum.tag_password_required.button_submit')}
          </Button>
        </div>
      </form>
    );
  }

  onsubmit(tag, e) {
    e.preventDefault();

    const tagId = tag.id;

    this.loading[tagId] = true;
    this.invalid[tagId] = false;

    const body = { data: { id: tagId } };

    if (this.passwords[tagId]) {
      body.data.password = this.passwords[tagId]();
    }

    app
      .request({
        url: app.forum.attribute('apiUrl') + '/datlechin/tag-passwords/auth',
        method: 'POST',
        body,
      })
      .then(() => {
        this.unlocked[tagId] = true;
        this.loading[tagId] = false;
        this.invalid[tagId] = false;

        if (this.allUnlocked()) {
          this.reloadDiscussion();
        }

        m.redraw();
      })
      .catch(() => {
        this.invalid[tagId] = true;
        this.loading[tagId] = false;
        m.redraw();
      });
  }

  allUnlocked() {
    const discussion = this.attrs.discussion;
    const pwTags = discussion.protectedPasswordTags() || [];
    const groupTags = discussion.protectedGroupPermissionTags() || [];
    const allTags = [...pwTags, ...groupTags];

    return allTags.every((tag) => this.unlocked[tag.id]);
  }

  reloadDiscussion() {
    const discussion = this.attrs.discussion;

    app.store
      .find('discussions', discussion.id())
      .then(() => {
        window.location.reload();
      })
      .catch(() => {
        window.location.reload();
      });
  }
}
