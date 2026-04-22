from django.db import migrations


FIX_MEMBER_SUBSCRIPTION_FK_SQL = """
DO $$
DECLARE
    constraint_record record;
BEGIN
    IF EXISTS (SELECT 1 FROM members_membersubscription WHERE member_id IS NOT NULL) THEN
        RAISE EXCEPTION 'Cannot auto-convert members_membersubscription.member_id from bigint to uuid while rows exist. Clear or migrate subscription rows manually first.';
    END IF;

    FOR constraint_record IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'members_membersubscription'::regclass
          AND conname LIKE '%member_id%'
    LOOP
        EXECUTE format('ALTER TABLE members_membersubscription DROP CONSTRAINT %I', constraint_record.conname);
    END LOOP;

    ALTER TABLE members_membersubscription
        ALTER COLUMN member_id TYPE uuid USING NULL::uuid;

    ALTER TABLE members_membersubscription
        ADD CONSTRAINT members_membersubscription_member_id_fk
        FOREIGN KEY (member_id)
        REFERENCES members_member(member_id)
        DEFERRABLE INITIALLY DEFERRED;
END $$;
"""


FIX_MEMBER_PAYMENT_FK_SQL = """
DO $$
DECLARE
    constraint_record record;
BEGIN
    IF EXISTS (SELECT 1 FROM members_memberpayment WHERE member_id IS NOT NULL) THEN
        RAISE EXCEPTION 'Cannot auto-convert members_memberpayment.member_id from bigint to uuid while rows exist. Clear or migrate payment rows manually first.';
    END IF;

    FOR constraint_record IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'members_memberpayment'::regclass
          AND conname LIKE '%member_id%'
    LOOP
        EXECUTE format('ALTER TABLE members_memberpayment DROP CONSTRAINT %I', constraint_record.conname);
    END LOOP;

    ALTER TABLE members_memberpayment
        ALTER COLUMN member_id TYPE uuid USING NULL::uuid;

    ALTER TABLE members_memberpayment
        ADD CONSTRAINT members_memberpayment_member_id_fk
        FOREIGN KEY (member_id)
        REFERENCES members_member(member_id)
        DEFERRABLE INITIALLY DEFERRED;
END $$;
"""


class Migration(migrations.Migration):

    dependencies = [
        ("members", "0004_alter_member_payment_status"),
    ]

    operations = [
        migrations.RunSQL(FIX_MEMBER_SUBSCRIPTION_FK_SQL, reverse_sql=migrations.RunSQL.noop),
        migrations.RunSQL(FIX_MEMBER_PAYMENT_FK_SQL, reverse_sql=migrations.RunSQL.noop),
    ]
