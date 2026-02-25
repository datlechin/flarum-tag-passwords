<?php

namespace Datlechin\TagPasswords\Policy;

use Datlechin\TagPasswords\TagProtectionChecker;
use Flarum\Tags\Tag;
use Flarum\User\Access\AbstractPolicy;
use Flarum\User\User;

class TagPolicy extends AbstractPolicy
{
    public function isTagUnlocked(User $actor, Tag $tag): bool
    {
        return TagProtectionChecker::isUnlocked($actor, $tag);
    }
}
